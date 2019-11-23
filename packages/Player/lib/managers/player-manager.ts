/**
 * 这是一个用于管理用户状态的管理类
 */
import _ from 'lodash';
import { Socket } from 'trpg/core';
import Redis from 'ioredis';
import { Platform } from 'packages/Player/types/player';
import { ICache } from 'packages/Core/lib/cache';
import { EventEmitter } from 'events';
import Debug from 'debug';
const debug = Debug('trpg:component:player:manager');

const ONLINE_PLAYER_KEY = 'player:manager:online_player_uuid_list';
const CHANNEL_KEY = 'player:manager:channel';
const TICK_PLAYER_EVENTNAME = 'player::tick';
const getRoomKey = (uuid: string) => `player:manager:room#${uuid}`;

// 消息类型: 单播 房间广播 全体广播
type PlayerMsgPayloadType = 'unicast' | 'listcast' | 'roomcast' | 'broadcast';
export interface PlayerMsgPayload {
  type: PlayerMsgPayloadType;
  target?: string; // UUID 如果为单播则为用户UUID或UUIDKey， 如果为房间广播则为房间UUID 如果为广播则不填
  targets?: string[]; // 专门用于列播 存储多个目标的UUID或UUIDKey
  eventName: string;
  data: {};
}

export interface PlayerManagerPlayerMapItem {
  uuid: string;
  platform: Platform;
  socket: Socket;
  rooms: Set<string>; //加入的房间的列表
}

export interface PlayerManagerPlayerMap {
  [socketId: string]: PlayerManagerPlayerMapItem;
}

interface PlayerManagerOptions {
  redisUrl: string;
  cache: ICache;
}

class PlayerManager extends EventEmitter {
  players: PlayerManagerPlayerMap = {}; // 玩家列表Map, 此处保存本地的映射
  onlinePlayerUUIDList: string[] = []; // 仅用于无redis环境
  cache: ICache;

  pubClient: Redis.Redis;
  subClient: Redis.Redis;

  constructor(options: PlayerManagerOptions) {
    super();

    const redisUrl = options.redisUrl;
    if (!redisUrl) {
      throw new Error(
        '[PlayerManager] require redisUrl to build pub/sub service'
      );
    }

    this.cache = options.cache;
    this.pubClient = new Redis(redisUrl);
    this.subClient = new Redis(redisUrl);

    this.initListener();
  }

  /**
   * 初始化监听器
   * 通过redis作为一个MQ系统来获取分布式通信
   */
  initListener() {
    this.subClient.subscribe(CHANNEL_KEY);
    this.subClient.on('message', (channel, message) => {
      if (channel === CHANNEL_KEY) {
        try {
          const payload: PlayerMsgPayload = JSON.parse(message);
          this.handleMessage(payload);

          this.emit('message', payload); // 将所有接受到的payload都转发到监听
        } catch (e) {
          debug('receive redis sub message error with %s :%o', message, e);
        }
      }
    });
  }

  private internalFn = {
    _remoteJoinRoom(
      this: PlayerManager,
      player: PlayerManagerPlayerMapItem,
      data: { roomUUID: string }
    ) {
      this.joinRoom(data.roomUUID, player.socket);
    },
    _remoteLeaveRoom(
      this: PlayerManager,
      player: PlayerManagerPlayerMapItem,
      data: { roomUUID: string }
    ) {
      this.leaveRoom(data.roomUUID, player.socket);
    },
  };

  private async handleMessage(payload: PlayerMsgPayload) {
    const { type, target, targets, eventName, data } = payload;
    let waitToSendPlayers: PlayerManagerPlayerMapItem[] = []; // 本地涉及到的Player列表

    const unicastHandler = (_target: string) => {
      // 加载单个目标到待推送列表
      if (this.isUUIDKey(_target)) {
        // 是UUIDkey. 则精确检测
        const playerUUID = this.getUUIDFromKey(_target);
        const platform = this.getPlatformFromKey(_target);
        const player = this.findPlayerWithUUIDPlatform(playerUUID, platform);
        if (!_.isUndefined(player)) {
          waitToSendPlayers.push(player);
        }
      } else {
        const playerUUID = _target;
        waitToSendPlayers.push(...this.findPlayerWithUUID(playerUUID));
      }
    };

    if (type === 'unicast') {
      // 单播
      unicastHandler(target);
    } else if (type === 'listcast') {
      // 列播
      for (const t of targets) {
        unicastHandler(t);
      }
    } else if (type === 'roomcast') {
      // 房间广播
      const roomUUID = target;
      const allSocketIds = await this.getRoomAllSocketIds(roomUUID);
      const localSocketIds = allSocketIds.filter(
        (socketId) => !!this.players[socketId]
      );
      waitToSendPlayers.push(
        ...localSocketIds.map((socketId) => this.players[socketId])
      );
    } else if (type === 'broadcast') {
      waitToSendPlayers.push(...Object.values(this.players));
    }

    for (const player of waitToSendPlayers) {
      // 循环发送消息
      if (this.internalFn[eventName]) {
        // 如果有内部处理方法
        this.internalFn[eventName].call(this, player, data);
      } else {
        // 发送到客户端
        this.emitToPlayer(player, eventName, data);
      }
    }
  }

  private async emitToPlayer(
    player: PlayerManagerPlayerMapItem,
    eventName: string,
    data: {}
  ) {
    const socket = player.socket;
    if (socket.connected) {
      socket.emit(eventName, data);

      if (eventName === TICK_PLAYER_EVENTNAME) {
        // 如果为踢出的话。还要移除player
        this.removePlayer(
          player.uuid,
          player.platform,
          _.get(data, 'by') === 'self'
        );
      }
    }
  }

  /**
   * 接受到远程消息的回调
   * @param listener 监听器
   */
  onMessage(listener: (payload: PlayerMsgPayload) => void) {
    this.on('message', listener);
  }

  /**
   * 向公用通道发送用户消息
   * @param payload 消息体
   */
  async emitPlayerMsg(payload: PlayerMsgPayload): Promise<void> {
    await this.pubClient.publish(CHANNEL_KEY, JSON.stringify(payload));
  }

  /**
   * 加入房间
   * 在Redis存储一个Set记录每个房间的成员
   * 值为socketId
   * @param roomUUID 房间UUID
   * @param socket socket连接
   */
  async joinRoom(roomUUID: string, socket: Socket): Promise<void> {
    const roomKey = getRoomKey(roomUUID);
    const socketId = socket.id;
    const player = this.players[socketId];
    if (player) {
      // 只有在用户有记录的情况下才能加入房间。离开的时候不用关心
      await this.cache.sadd(roomKey, socketId);
      player.rooms.add(roomUUID);
    } else {
      debug('join room fail, not found player in local %s', socketId);
    }
  }

  async joinRoomWithUUID(roomUUID: string, uuid: string): Promise<void> {
    await this.unicastSocketEvent(uuid, '_remoteJoinRoom', { roomUUID });
  }

  /**
   * 离开房间
   * @param roomUUID 房间UUID
   * @param socket socket连接
   */
  async leaveRoom(roomUUID: string, socket: Socket): Promise<void> {
    const roomKey = getRoomKey(roomUUID);
    const socketId = socket.id;
    await this.cache.srem(roomKey, socketId);
    const player = this.players[socketId];
    if (player && _.isSet(player.rooms)) {
      player.rooms.delete(roomUUID);
    }
  }

  async leaveRoomWithUUID(roomUUID: string, uuid: string): Promise<void> {
    await this.unicastSocketEvent(uuid, '_remoteLeaveRoom', { roomUUID });
  }

  async getRoomAllSocketIds(roomUUID: string): Promise<string[]> {
    return (await this.cache.smembers(getRoomKey(roomUUID))) as string[];
  }

  /**
   * 向指定用户发送socket事件(全平台)
   * @param uuid 用户UUID
   * @param eventName 事件名
   * @param data 数据
   */
  async unicastSocketEvent(uuid: string, eventName: string, data: {}) {
    const payload: PlayerMsgPayload = {
      type: 'unicast',
      target: uuid,
      eventName,
      data,
    };

    await this.emitPlayerMsg(payload);
  }

  /**
   * 向一批用户发送列播事件
   * @param uuids 用户uuid列表
   * @param eventName 事件名
   * @param data 数据
   */
  async listcastSocketEvent(uuids: string[], eventName: string, data: {}) {
    const payload: PlayerMsgPayload = {
      type: 'listcast',
      targets: uuids,
      eventName,
      data,
    };

    await this.emitPlayerMsg(payload);
  }

  /**
   * 向房间中所有的用户发送socket事件
   * @param roomUUID 房间UUID
   * @param eventName 事件名
   * @param data 数据
   */
  async roomcastSocketEvent(roomUUID: string, eventName: string, data: {}) {
    const payload: PlayerMsgPayload = {
      type: 'roomcast',
      target: roomUUID,
      eventName,
      data,
    };

    await this.emitPlayerMsg(payload);
  }
  /**
   * 向所有连接发送广播socket事件
   * @param eventName 事件名
   * @param data 数据
   */
  async broadcastSocketEvent(eventName: string, data: {}) {
    const payload: PlayerMsgPayload = {
      type: 'broadcast',
      eventName,
      data,
    };

    await this.emitPlayerMsg(payload);
  }

  /**
   * 关闭所有的pubsub连接
   * 移除所有的用户数据
   */
  async close() {
    try {
      // 移除用户
      await Promise.all(
        Object.values(this.players).map((player) =>
          this.removePlayer(player.uuid, player.platform)
        )
      ).then(() => debug('[PlayerManager] 移除所有用户成功'));

      _.invoke(this.pubClient, 'disconnect');
      _.invoke(this.subClient, 'disconnect');
    } catch (err) {
      console.error('[PlayerManager] 关闭失败', err);
    }
  }

  private getUUIDKey(uuid: string, platform: Platform): string {
    return `${platform}#${uuid}`;
  }

  private isUUIDKey(key: string): boolean {
    return key.indexOf('#') >= 0;
  }

  private getUUIDFromKey(uuidKey: string): string {
    return _.last(uuidKey.split('#'));
  }

  private getPlatformFromKey(uuidKey: string): Platform {
    return _.head(uuidKey.split('#')) as Platform;
  }

  /**
   * 增加玩家
   * @param uuid 用户UUID
   * @param socket 用户Socket连接
   * @returns 返回是否添加成功
   */
  async addPlayer(
    uuid: string,
    socket: Socket,
    platform: Platform = 'web'
  ): Promise<boolean> {
    const uuidKey = this.getUUIDKey(uuid, platform);

    // 添加到在线列表
    // 此处需要使用uuidKey, 为了保证移除时只会移除该平台的登录数据
    const isLock = await this.cache.lock(ONLINE_PLAYER_KEY);
    if (!isLock) {
      // 如果已被别的服务占用了。则跳过
      return false;
    }

    const isExist = await this.cache.sismember(ONLINE_PLAYER_KEY, uuidKey);
    if (isExist) {
      // 如果已存在则踢掉用户
      await this.tickPlayer(uuid, platform, 'self');
    } else {
      // 不存在则新增
      await this.cache.sadd(ONLINE_PLAYER_KEY, uuidKey);
    }
    await this.cache.unlock(ONLINE_PLAYER_KEY);

    // 添加到本地的会话管理
    this.players[socket.id] = {
      uuid,
      platform,
      socket,
      rooms: new Set(),
    };

    return true;
  }

  /**
   * 根据socket连接查找用户
   * @param socket Socket连接
   */
  findPlayer(socket: Socket): PlayerManagerPlayerMapItem | null {
    if (!socket) {
      return null;
    }

    const socketId = socket.id;
    return this.players[socketId] || null;
  }

  /**
   * 根据用户UUID查找用户信息
   * NOTE: 只能获取本地，可能会漏
   * @param uuid 用户UUID
   */
  findPlayerWithUUID(uuid: string): PlayerManagerPlayerMapItem[] {
    return Object.values(this.players).filter((item) => item.uuid === uuid);
  }

  /**
   * 根据用户UUID和平台查找用户信息
   * @param uuid 用户UUID
   */
  findPlayerWithUUIDPlatform(
    uuid: string,
    platform: Platform
  ): PlayerManagerPlayerMapItem | undefined {
    return Object.values(this.players).find(
      (item) => item.uuid === uuid && item.platform === platform
    );
  }

  /**
   * 移除玩家
   * @param uuid uuid
   * @param platform 平台
   * @param retainStatus 是否保留用户登录状态，用于用户自己踢自己
   */
  async removePlayer(
    uuid: string,
    platform: Platform = 'web',
    retainStatus: boolean = false
  ): Promise<void> {
    debug('[PlayerManager] remove player %s[%s]', uuid, platform);
    const uuidKey = this.getUUIDKey(uuid, platform);

    const player = this.findPlayerWithUUIDPlatform(uuid, platform);
    if (!player) {
      return;
    }
    const socket = player.socket;
    delete this.players[socket.id]; // 从本地的会话管理列表中移除

    if (socket.connected) {
      socket.disconnect();
    }

    if (!retainStatus) {
      // 离开房间
      await Promise.all([
        this.cache.srem(ONLINE_PLAYER_KEY, uuidKey), // 如果不需要保留登录状态 则移除用户的登录状态
        ...Array.from(player.rooms).map((roomUUID) =>
          this.leaveRoom(roomUUID, socket)
        ),
      ]).then(() =>
        debug(`[PlayerManager] 用户[${uuid}]已移除登录状态并已离开所有房间`)
      );
    }
  }

  /**
   * 踢掉用户
   * @param uuid 用户UUID
   * @param platform 用户平台
   */
  async tickPlayer(
    uuid: string,
    platform: Platform,
    by: string = ''
  ): Promise<void> {
    debug(`用户[${platform}#${uuid}]被踢出 by ${by}`);
    const uuidKey = this.getUUIDKey(uuid, platform);
    await this.unicastSocketEvent(uuidKey, TICK_PLAYER_EVENTNAME, {
      msg: '你已在其他地方登陆',
      by,
    });
  }

  /**
   * 获取在线用户数
   * @param uniq 是否将各个平台的连接视为一个用户
   */
  async getOnlinePlayerCount(uniq = false): Promise<number> {
    const members = await this.cache.smembers(ONLINE_PLAYER_KEY);

    if (uniq === false) {
      return members.length;
    } else if (uniq === true) {
      return _.uniqBy(members, this.getUUIDFromKey).length;
    }
  }

  /**
   * 检测用户是否在线
   * @param uuid 用户UUID
   */
  async checkPlayerOnline(uuid: string): Promise<boolean> {
    const members = await this.cache.smembers(ONLINE_PLAYER_KEY);
    return members.map(this.getUUIDFromKey).includes(uuid);
  }
}

let playerManager: PlayerManager;

/**
 * 获取玩家状态管理器
 * @param options 配置项，仅在第一次获取时有效
 */
export const getPlayerManager = (options: PlayerManagerOptions) => {
  if (!playerManager) {
    playerManager = new PlayerManager(options);
  }

  return playerManager;
};

export type PlayerManagerCls = PlayerManager;
