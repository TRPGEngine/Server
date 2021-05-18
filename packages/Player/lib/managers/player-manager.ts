/**
 * 这是一个用于管理用户状态的管理类
 */
import _ from 'lodash';
import { Socket } from 'trpg/core';

import { Platform } from 'packages/Player/types/player';
import {
  SocketManager,
  SocketManagerOptions,
} from 'packages/Core/lib/managers/socket-manager';
import Debug from 'debug';
import { getLogger } from 'packages/Core/lib/logger';
const debug = Debug('trpg:component:player:manager');

const appLogger = getLogger('application');

const ONLINE_PLAYER_KEY = 'player:manager:online_player_uuid_list';
const CHANNEL_KEY = 'player:manager:channel';
const TICK_PLAYER_EVENTNAME = 'player::tick';
export const getRoomKey = (uuid: string) => `player:manager:room#${uuid}`;

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

class PlayerManager extends SocketManager<PlayerMsgPayload> {
  getRoomKey = getRoomKey;

  players: PlayerManagerPlayerMap = {}; // 玩家列表Map, 此处保存本地的映射
  onlinePlayerUUIDList: string[] = []; // 仅用于无redis环境

  constructor(options: SocketManagerOptions) {
    super(CHANNEL_KEY, options);
  }

  /**
   * 内部方法
   */
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

  /**
   * 基于Player的强关联重写了消息处理方式
   */
  protected async handleMessage(payload: PlayerMsgPayload) {
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
      if (typeof this.internalFn[eventName] === 'function') {
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

  async joinRoom(roomUUID: string, socket: Socket): Promise<void> {
    const socketId = socket.id;
    const player = this.players[socketId];
    if (player) {
      // 只有在用户有记录的情况下才能加入房间。离开的时候不用关心
      await super.joinRoom(roomUUID, socket);
      player.rooms.add(roomUUID);
    } else {
      debug('join room fail, not found player in local %s', socketId);
    }
  }

  /**
   * 让某个用户远程加入房间
   * @param roomUUID 房间UUID
   * @param uuid 用户UUID
   */
  async joinRoomWithUUID(roomUUID: string, uuid: string): Promise<void> {
    await this.unicastSocketEvent(uuid, '_remoteJoinRoom', { roomUUID });
  }
  async joinRoomWithUUIDs(roomUUID: string, uuids: string[]): Promise<void> {
    await this.listcastSocketEvent(uuids, '_remoteJoinRoom', { roomUUID });
  }

  async leaveRoom(roomUUID: string, socket: Socket): Promise<void> {
    await super.leaveRoom(roomUUID, socket);

    const socketId = socket.id;
    const player = this.players[socketId];
    if (player && _.isSet(player.rooms)) {
      player.rooms.delete(roomUUID);
    }
  }

  /**
   * 让某个用户远程离开房间
   * NOTICE: 需要注意会不会出现同一用户有两个连接被踢的情况
   * 这些方法只能用于离开房间的操作。不能用于断开连接
   * @param roomUUID 房间UUID
   * @param uuid 用户UUID
   */
  async leaveRoomWithUUID(roomUUID: string, uuid: string): Promise<void> {
    await this.unicastSocketEvent(uuid, '_remoteLeaveRoom', { roomUUID });
  }
  async leaveRoomWithUUIDs(roomUUID: string, uuids: string[]): Promise<void> {
    await this.listcastSocketEvent(uuids, '_remoteLeaveRoom', { roomUUID });
  }

  /**
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

      await super.close();
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
    const lockKey = `${ONLINE_PLAYER_KEY}:${uuidKey}`;

    // 添加到在线列表
    // 此处需要使用uuidKey, 为了保证移除时只会移除该平台的登录数据
    const isLock = await this.cache.lock(lockKey);
    if (!isLock) {
      // 如果已被别的服务占用了。则跳过
      return false;
    }

    const isExist = await this.cache.sismember(ONLINE_PLAYER_KEY, uuidKey);
    if (isExist) {
      // 如果已存在则踢掉用户
      this.tickPlayer(uuid, platform, 'self');

      // 确保在之前的用户被执行踢出操作以后再继续执行后续代码
      await this.waitForMessage((payload) => {
        return (
          payload.eventName === TICK_PLAYER_EVENTNAME &&
          payload.target === this.getUUIDKey(uuid, platform)
        );
      });
    } else {
      // 不存在则新增
      await this.cache.sadd(ONLINE_PLAYER_KEY, uuidKey);
    }
    await this.cache.unlock(lockKey);

    // 添加到本地的会话管理
    appLogger.info(`[PlayerManager] add player socket ${socket.id}`);
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
   * 从在线玩家列表移除玩家
   * @param uuid uuid
   * @param platform 平台
   * @param retainStatus 是否保留用户登录列表，用于用户自己踢自己
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
    appLogger.info(`[PlayerManager] remove player socket ${socket.id}`);
    delete this.players[socket.id]; // 从本地的会话管理列表中移除

    if (socket.connected) {
      socket.disconnect();
    }

    if (!retainStatus) {
      await this.cache
        .srem(ONLINE_PLAYER_KEY, uuidKey) // 如果不需要保留登录状态 则移除用户的登录状态
        .then(() => debug(`[PlayerManager] 用户[${uuid}]已移除登录状态`));
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
   * 获取在线玩家列表
   * 格式: <platform>#<uuid>
   */
  async getOnlinePlayerList(): Promise<string[]> {
    return (await this.cache.smembers(ONLINE_PLAYER_KEY)) as string[];
  }

  /**
   * 获取在线用户数
   * @param uniq 是否将各个平台的连接视为一个用户
   */
  async getOnlinePlayerCount(uniq = false): Promise<number> {
    const members = await this.getOnlinePlayerList();

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
    const members = await this.getOnlinePlayerList();
    return members.map(this.getUUIDFromKey).includes(uuid);
  }
}

let playerManager: PlayerManager;

/**
 * 获取玩家状态管理器
 * @param options 配置项，仅在第一次获取时有效
 */
export const getPlayerManager = (options: SocketManagerOptions) => {
  if (!playerManager) {
    playerManager = new PlayerManager(options);
  }

  return playerManager;
};

export type PlayerManagerCls = PlayerManager;
