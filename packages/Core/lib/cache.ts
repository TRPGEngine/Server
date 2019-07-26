const util = require('util');
import Redis from 'ioredis';
import Debug from 'debug';
const debug = Debug('trpg:cache');
import _ from 'lodash';
import minimatch from 'minimatch';

export type CacheValue = string | number | {};
interface CacheOptions {
  expires: number;
}
interface RedisOpts {
  url: string;
}

const defaultOption: CacheOptions = {
  expires: 1000 * 60 * 60 * 24, // 默认缓存一天, 0为不过期
};

export interface ICache {
  set(
    key: string,
    value: CacheValue,
    options?: CacheOptions
  ): Promise<CacheValue>;
  rpush(key: string, ...values: any[]): void;

  /**
   * 清理列表一定范围内的数据
   * @param key 唯一键
   * @param start 起始索引
   * @param size 清理列表长度
   */
  lclear(key: string, start: number, size: number): void;

  /**
   * 返回存储中符合条件的键值列表
   * @param glob 匹配规则
   */
  keys(glob: string): Promise<string[]>;
  get(key: string): Promise<CacheValue>;
  getWithGlob(glob: string): Promise<{ [key: string]: CacheValue }>;

  /**
   * 获取列表
   * @param key 键
   */
  lget(key: string): Promise<CacheValue[]>;
  remove(key: string): Promise<any>;
  close(): void;
}

export class Cache implements ICache {
  data = {};

  set(
    key: string,
    value: CacheValue,
    options: CacheOptions
  ): Promise<CacheValue> {
    options = Object.assign({}, defaultOption, options);

    debug('[cache]', `set ${key} to ${JSON.stringify(value)}`);
    // this.data[key] = value;
    _.set(this.data, [key, 'rawData'], value);
    if (options.expires > 0) {
      _.set(
        this.data,
        [key, 'expires'],
        new Date().valueOf() + options.expires
      );
    }
    return Promise.resolve(value);
  }

  rpush(key: string, ...values: any[]): void {
    if (!this.data[key] || !Array.isArray(this.data[key])) {
      this.data[key] = [];
    }

    this.data[key].push(...values);
    debug('[cache]', `rpush ${key} with ${values.join(',')}`);
  }

  lclear(key: string, start: number, size: number): void {
    if (!this.data[key] || !Array.isArray(this.data[key])) {
      return;
    }

    const arr: any[] = this.data[key];
    arr.splice(start, size);
    debug('[cache]', `lclear ${key} in range [${start}, ${start + size}]`);
  }

  keys(glob: string): Promise<string[]> {
    return Promise.resolve(
      Object.keys(this.data).filter(minimatch.filter(glob))
    );
  }

  get(key: string): Promise<CacheValue> {
    const tmp = this.data[key];
    // IDEA: 这里可以考虑过期不删除。而是不返回数据。因为会被后面的set操作覆盖。是一种懒操作
    if (tmp) {
      if (!tmp.expires || tmp.expires < new Date().valueOf()) {
        // 若expires不存在或expires存在但尚未过期
        return Promise.resolve(tmp.rawData);
      }
    }
    return Promise.resolve(null);
  }

  async getWithGlob(glob: string): Promise<{ [key: string]: CacheValue }> {
    const keys = await this.keys(glob);
    if (keys.length > 0) {
      const values = keys
        .map((key) => this.data[key])
        .filter((x) => !x.expires || x.expires < new Date().valueOf())
        .map((val) => val.rawData);
      return _.zipObject(keys, values);
    }
    return null;
  }

  async lget(key: string): Promise<CacheValue[]> {
    const arr = await this.get(key);

    if (Array.isArray(arr)) {
      return arr;
    } else {
      return [arr];
    }
  }

  remove(key: string) {
    if (this.data[key]) {
      delete this.data[key];
    }
    return Promise.resolve(true);
  }

  close() {
    debug('start closing cache');
    this.data = {};
  }
}

export class RedisCache implements ICache {
  url: string;
  redis: Redis.Redis;

  constructor(opts: RedisOpts) {
    this.url = opts.url;
    this.redis = new Redis(this.url);
  }

  private genKey(key: string): string {
    if (!key.startsWith('trpg:')) {
      return `trpg:${key}`;
    }
    return key;
  }

  set(
    key: string,
    value: CacheValue,
    options: CacheOptions
  ): Promise<CacheValue> {
    key = this.genKey(key);
    options = Object.assign({}, defaultOption, options);

    debug('[redis]', `set ${key} to ${JSON.stringify(value)}`);
    this.redis.set(key, JSON.stringify(value));
    if (options.expires > 0) {
      // 使用redis内置的过期机制
      this.redis.pexpire(key, options.expires);
    }
    return this.redis.set(key, JSON.stringify(value));
  }

  rpush(key: string, ...values: any[]): void {
    key = this.genKey(key);
    this.redis.rpush(key, ...values);
    debug('[redis]', `rpush ${key} with ${values.join(',')}`);
  }

  // ltrim 为保留一部分。即清理的逻辑下保留的数据应为 (start + size, -1)
  lclear(key: string, start: number, size: number): void {
    key = this.genKey(key);
    this.redis.ltrim(key, start + size, -1);
    debug('[redis]', `lclear ${key} in range [${start}, ${start + size}]`);
  }

  async keys(glob: string): Promise<string[]> {
    // TODO: 需要使用scan来优化
    glob = this.genKey(glob);
    return await this.redis.keys(glob);
  }

  async get(key: string): Promise<CacheValue> {
    key = this.genKey(key);
    const val = await this.redis.get(key);
    return JSON.parse(val);
  }

  async getWithGlob(glob: string): Promise<{ [key: string]: CacheValue }> {
    const keys = await this.keys(glob);
    if (keys.length > 0) {
      const values = await Promise.all(keys.map((key) => this.get(key)));
      return _.zipObject(keys, values);
    }
    return Promise.resolve(null);
  }

  async lget(key: string): Promise<CacheValue[]> {
    key = this.genKey(key);
    const arr = await this.redis.lrange(key, 0, -1); // 获取所有值
    return arr;
  }

  remove(key: string): Promise<number> {
    key = this.genKey(key);
    return this.redis.del(key);
  }

  close(): void {
    debug('start closing redis cli');
    this.redis.disconnect();
  }
}
