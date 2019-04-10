const util = require('util');
const Redis = require('ioredis');
const debug = require('debug')('trpg:cache');

// TODO: 需要实现过期时间

function Cache(opts) {
  this.data = {};
}
Cache.prototype.set = function(key, value) {
  debug('[cache]', `set ${key} to ${JSON.stringify(value)}`);
  this.data[key] = value;
  return value;
}
Cache.prototype.get = function(key) {
  return this.data[key];
}
Cache.prototype.remove = function(key) {
  if(this.data[key]) {
    delete this.data[key];
  }
  return true;
}
Cache.prototype.close = function() {
  debug('start closing cache');
  this.data = {};
}

function RedisCache(opts) {
  this.url = opts.url;
  this.redis = new Redis(this.url);
}
util.inherits(RedisCache, Cache);

RedisCache.prototype.set = function(key, value) {
  debug('[redis]', `set ${key} to ${JSON.stringify(value)}`);
  return this.redis.set(`trpg:${key}`, JSON.stringify(value));
}
RedisCache.prototype.get = function(key) {
  return this.redis.get(`trpg:${key}`).then(val => JSON.parse(val));
}
RedisCache.prototype.remove = function(key) {
  return this.redis.del(`trpg:${key}`);
}
RedisCache.prototype.close = function() {
  debug('start closing redis cli');
  return this.redis.disconnect();
}

exports.Cache = Cache;
exports.RedisCache = RedisCache;
