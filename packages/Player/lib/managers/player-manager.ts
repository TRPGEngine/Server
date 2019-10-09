/**
 * NOTE: 未实装
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

const ONLINE_PLAYER_KEY = 'online_player_uuid_list';
const CHANNEL_KEY = 'player_manager_channel';
const getRoomKey = (uuid: string) => `player_manager_room#${uuid}`;

// 消息类型: 单播 房间广播 全体广播
type PlayerMsgPayloadType = 'unicast' | 'roomcase' | 'broadcast';
export interface PlayerMsgPayload {
  type: PlayerMsgPayloadType;
  target?: string; // UUID 如果为单播则为用户UUID， 如果为房间广播则为房间UUID 如果为广播则不填
  eventName: string;
  data: {};
}

interface PlayerManagerPlayerMapItem {
  uuid: string;
  platform: string;
  socket: Socket;
  rooms: Set<string>; //加入的房间的列表
}

interface PlayerManagerPlayerMap {
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

  private async handleMessage(payload: PlayerMsgPayload) {
    const { type, target, eventName, data } = payload;
    let waitToSendPlayers: PlayerManagerPlayerMapItem[] = []; // 本地涉及到的Player列表

    if (type === 'unicast') {
      // 单播
      const playerUUID = target;
      waitToSendPlayers.push(...this.findPlayerWithUUID(playerUUID));
    } else if (type === 'roomcase') {
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
      this.emitToPlayer(player, eventName, data);
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
    player.rooms.delete(roomUUID);
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
   * 向房间中所有的用户发送socket事件
   * @param roomUUID 房间UUID
   * @param eventName 事件名
   * @param data 数据
   */
  async roomcastSocketEvent(roomUUID: string, eventName: string, data: {}) {
    const payload: PlayerMsgPayload = {
      type: 'roomcase',
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
   */
  close() {
    _.invoke(this.pubClient, 'disconnect');
    _.invoke(this.subClient, 'disconnect');
  }

  private getUUIDKey(uuid: string, platform: string): string {
    return `${platform}#${uuid}`;
  }

  private getUUIDFromKey(uuidKey: string): string {
    return _.last(uuidKey.split('#'));
  }

  private getPlatformFromKey(uuidKey: string): string {
    return _.head(uuidKey.split('#'));
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
      return false;
    }
    await this.cache.sadd(ONLINE_PLAYER_KEY, uuidKey);
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
   * @param uuid 用户UUID
   */
  findPlayerWithUUID(uuid: string): PlayerManagerPlayerMapItem[] {
    return Object.values(this.players).filter((item) => item.uuid === uuid);
  }

  /**
   * 移除玩家
   * @param uuid uuid
   * @param platform 平台
   */
  removePlayer(uuid: string, platform: Platform = 'web') {
    const uuidKey = this.getUUIDKey(uuid, platform);

    // 从在线列表中移除
    this.cache.srem(ONLINE_PLAYER_KEY, uuidKey);

    const player = this.players[uuidKey];
    const rooms = Array.from(player.rooms); // 浅拷贝一波
    const socket = player.socket;
    rooms.forEach((roomUUID) => {
      this.leaveRoom(roomUUID, socket); // 离开房间
    });

    // 从本地的会话管理列表中移除
    delete this.players[uuidKey];
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
