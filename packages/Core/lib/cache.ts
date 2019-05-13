const util = require('util');
const Redis = require('ioredis');
import Debug from 'debug';
const debug = Debug('trpg:cache');
import _ from 'lodash';

const defaultOption = {
  expires: 1000 * 60 * 60 * 24, // 默认缓存一天, 0为不过期
};

function Cache(opts) {
  this.data = {};
}
Cache.prototype.set = function(key, value, options) {
  options = Object.assign({}, defaultOption, options);

  debug('[cache]', `set ${key} to ${JSON.stringify(value)}`);
  // this.data[key] = value;
  _.set(this.data, [key, 'rawData'], value);
  if (options.expires > 0) {
    _.set(this.data, [key, 'expires'], new Date().valueOf() + options.expires);
  }
  return value;
};
Cache.prototype.get = function(key) {
  const tmp = this.data[key];
  // IDEA: 这里可以考虑过期不删除。而是不返回数据。因为会被后面的set操作覆盖。是一种懒操作
  if (tmp) {
    if (!tmp.expires || tmp.expires < new Date().valueOf()) {
      // 若expires不存在或expires存在但尚未过期
      return tmp.rawData;
    }
  }
  return null;
};
Cache.prototype.remove = function(key) {
  if (this.data[key]) {
    delete this.data[key];
  }
  return true;
};
Cache.prototype.close = function() {
  debug('start closing cache');
  this.data = {};
};

function RedisCache(opts) {
  this.url = opts.url;
  this.redis = new Redis(this.url);
}
util.inherits(RedisCache, Cache);

RedisCache.prototype.set = function(key, value, options) {
  options = Object.assign({}, defaultOption, options);

  debug('[redis]', `set ${key} to ${JSON.stringify(value)}`);
  this.redis.set(`trpg:${key}`, JSON.stringify(value));
  if (options.expires > 0) {
    // 使用redis内置的过期机制
    this.redis.pexpire(`trpg:${key}`, options.expires);
  }
  return this.redis.set(`trpg:${key}`, JSON.stringify(value));
};
RedisCache.prototype.get = function(key) {
  return this.redis.get(`trpg:${key}`).then((val) => JSON.parse(val));
};
RedisCache.prototype.remove = function(key) {
  return this.redis.del(`trpg:${key}`);
};
RedisCache.prototype.close = function() {
  debug('start closing redis cli');
  return this.redis.disconnect();
};

exports.Cache = Cache;
exports.RedisCache = RedisCache;
