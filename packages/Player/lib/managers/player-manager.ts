/**
 * NOTE: 未实装
 * 这是一个用于管理用户状态的管理类
 */
import _ from 'lodash';
import { Socket } from 'trpg/core';
import { Redis } from 'ioredis';
import { Platform } from 'packages/Player/types/player';
import { ICache } from 'packages/Core/lib/cache';

const ONLINE_PLAYER_KEY = 'online_player_uuid_list';

interface PlayerManagerOptions {
  redis?: Redis;
  cache?: ICache;
}

class PlayerManager {
  players = {}; // 玩家列表Map, key为UUIDKey, 此处保存本地的映射
  onlinePlayerUUIDList: string[] = []; // 仅用于无redis环境
  redis: Redis;
  cache: ICache;

  constructor(options: PlayerManagerOptions) {
    this.redis = options.redis;
    this.cache = options.cache;
  }

  get isRedis(): boolean {
    return !!this.redis;
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
    this.players[uuidKey] = socket;

    return true;
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
