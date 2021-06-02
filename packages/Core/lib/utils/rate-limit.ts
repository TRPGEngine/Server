import {
  RateLimiterRedis,
  RateLimiterAbstract,
  RateLimiterMemory,
  IRateLimiterOptions,
} from 'rate-limiter-flexible';
import IORedis from 'ioredis';
import type { TRPGMiddleware, TRPGApplication } from 'trpg/core';
import _ from 'lodash';
import config from 'config';
import { errorCode, LimitedError } from 'lib/error';
import { RedisCache } from '../cache';

const rateLimit =
  config.get<{
    points: number;
    duration: number;
  }>('rateLimit');

export interface RateLimiter extends RateLimiterAbstract {}

const baseOptions: IRateLimiterOptions = {
  // Basic options

  points: rateLimit.points ?? 50, // Number of points
  duration: rateLimit.duration ?? 5, // Per second(s)

  // Custom
  execEvenly: false, // Do not delay actions evenly
  blockDuration: 0, // Do not block if consumed more than points
  keyPrefix: 'trpg-limiter', // must be unique for limiters with different purpose
};

const getKeyPrefix = (keyPrefix: string | undefined | null) => {
  const k = keyPrefix ?? '';
  if (k !== '') {
    return `trpg-limiter:${k}`;
  } else {
    return 'trpg-limiter';
  }
};

/**
 * 内存版
 * 创建一个速度限流器实例
 */
function createRateLimiterMemory(options?: IRateLimiterOptions): RateLimiter {
  const rateLimiterMemory = new RateLimiterMemory({
    ...baseOptions,
    ...options,
    keyPrefix: getKeyPrefix(options?.keyPrefix),
  });

  return rateLimiterMemory;
}

/**
 * Redis版
 * 创建一个速度限流器实例
 */
function createRateLimiterRedis(
  redisClient: IORedis.Redis,
  options?: IRateLimiterOptions
): RateLimiter {
  const rateLimiterRedis = new RateLimiterRedis({
    ...baseOptions,
    ...options,
    storeClient: redisClient,
    keyPrefix: getKeyPrefix(options?.keyPrefix),
  });

  return rateLimiterRedis;
}

/**
 * 根据一个应用实例来创建限制器
 * @param trpgapp 应用实例
 * @param options 配置 可为空
 */
export function createRateLimiterWithTRPGApplication(
  trpgapp: TRPGApplication,
  options?: IRateLimiterOptions
): RateLimiter {
  if (trpgapp.cache instanceof RedisCache) {
    // 当使用Redis作为缓存机制时
    const redisClient = trpgapp.cache.redis;
    return createRateLimiterRedis(redisClient, options);
  } else {
    // 其他情况
    return createRateLimiterMemory(options);
  }
}

/**
 * koa中间件限速
 */
export function rateLimitKoaMiddleware(): TRPGMiddleware {
  return async (ctx, next) => {
    try {
      const trpgapp = ctx.trpgapp;
      if (!_.isNil(trpgapp.rateLimiter)) {
        await trpgapp.rateLimiter.consume(ctx.ip);
      }
    } catch (rejRes) {
      ctx.status = 429;
      ctx.body = {
        result: false,
        msg: `Too Many Requests: ${ctx.ip}`,
        code: errorCode.LIMITED,
      };
      return; // 退出下一步
    }

    return next();
  };
}

/**
 * 检查Socket是否达到请求上限
 */
export async function rateLimitSocketCheck(app: TRPGApplication, ip: string) {
  try {
    if (!_.isNil(app.rateLimiter) && _.isString(ip)) {
      await app.rateLimiter.consume(ip);
    }
  } catch (err) {
    throw new LimitedError(`Too Many Requests: ${ip}`);
  }
}
