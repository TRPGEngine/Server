import {
  RateLimiterRedis,
  IRateLimiterStoreOptions,
  RateLimiterAbstract,
} from 'rate-limiter-flexible';
import IORedis from 'ioredis';
import type { TRPGMiddleware, TRPGApplication } from 'trpg/core';
import _ from 'lodash';
import config from 'config';
import { NoReportError } from 'lib/error';

const rateLimit = config.get<{
  points: number;
  duration: number;
}>('rateLimit');

export interface RateLimiter extends RateLimiterAbstract {}

/**
 * 创建一个速度限流器实例
 */
export function createRateLimiter(redisClient: IORedis.Redis): RateLimiter {
  const options: IRateLimiterStoreOptions = {
    // Basic options
    storeClient: redisClient,
    points: rateLimit.points ?? 50, // Number of points
    duration: rateLimit.duration ?? 5, // Per second(s)

    // Custom
    execEvenly: false, // Do not delay actions evenly
    blockDuration: 0, // Do not block if consumed more than points
    keyPrefix: 'trpg-limiter', // must be unique for limiters with different purpose
  };

  const rateLimiterRedis = new RateLimiterRedis(options);

  return rateLimiterRedis;
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
  }catch(err) {
    throw new NoReportError(`Too Many Requests: ${ip}`)
  }
}
