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

export interface PlayerMsgPayload {
  uuid: string; // 用户UUID
  platform: Platform; // 平台
  uuidKey?: string; // uuidkey。通过用户UUID和平台算出
  [other: string]: any;
}

interface PlayerManagerPlayerMapItem {
  uuid: string;
  platform: string;
  socket: Socket;
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

          const uuidKey = payload.uuidKey;
          if (_.isString(uuidKey) && this.players[uuidKey]) {
            // 仅当当前有该key存储时。处理数据
            const socket = this.players[uuidKey];
            this.emit('message', payload, socket);
          }
        } catch (e) {
          debug('receive redis sub message error with %s :%o', message, e);
        }
      }
    });
  }

  /**
   * 接受到远程消息的回调
   * @param listener 监听器
   */
  onMessage(listener: (payload: PlayerMsgPayload, socket: Socket) => void) {
    this.on('message', listener);
  }

  /**
   * 向公用通道发送用户消息
   * @param payload 消息体
   */
  async emitPlayerMsg(payload: PlayerMsgPayload): Promise<void> {
    payload.uuidKey = this.getUUIDKey(payload.uuid, payload.platform); // 计算UUIDKey
    await this.pubClient.publish(CHANNEL_KEY, JSON.stringify(payload));
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
