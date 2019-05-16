const util = require('util');
import Redis from 'ioredis';
import Debug from 'debug';
const debug = Debug('trpg:cache');
import _ from 'lodash';

type CacheValue = string | number | {};
interface CacheOptions {
  expires: number;
}
interface RedisOpts {
  url: string;
}

const defaultOption: CacheOptions = {
  expires: 1000 * 60 * 60 * 24, // 默认缓存一天, 0为不过期
};

interface ICache {
  set(
    key: string,
    value: CacheValue,
    options: CacheOptions
  ): Promise<CacheValue>;
  get(key: string): Promise<CacheValue>;
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

  set(
    key: string,
    value: CacheValue,
    options: CacheOptions
  ): Promise<CacheValue> {
    options = Object.assign({}, defaultOption, options);

    debug('[redis]', `set ${key} to ${JSON.stringify(value)}`);
    this.redis.set(`trpg:${key}`, JSON.stringify(value));
    if (options.expires > 0) {
      // 使用redis内置的过期机制
      this.redis.pexpire(`trpg:${key}`, options.expires);
    }
    return this.redis.set(`trpg:${key}`, JSON.stringify(value));
  }

  async get(key: string): Promise<CacheValue> {
    const val = await this.redis.get(`trpg:${key}`);
    return JSON.parse(val);
  }

  remove(key: string): Promise<number> {
    return this.redis.del(`trpg:${key}`);
  }

  close(): void {
    debug('start closing redis cli');
    this.redis.disconnect();
  }
}
