import {
  RateLimiterRedis,
  IRateLimiterStoreOptions,
  RateLimiterAbstract,
} from 'rate-limiter-flexible';
import IORedis from 'ioredis';
import { TRPGMiddleware } from 'trpg/core';
import _ from 'lodash';

export interface RateLimiter extends RateLimiterAbstract {}

/**
 * 创建一个速度限流器实例
 */
export function createRateLimiter(redisClient: IORedis.Redis): RateLimiter {
  const options: IRateLimiterStoreOptions = {
    // Basic options
    storeClient: redisClient,
    points: 50, // Number of points
    duration: 5, // Per second(s)

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
export function rateLimitMiddleware(): TRPGMiddleware {
  return async (ctx, next) => {
    try {
      const trpgapp = ctx.trpgapp;
      if (!_.isNil(trpgapp.rateLimiter)) {
        await trpgapp.rateLimiter.consume(ctx.ip);
      }
      await next();
    } catch (rejRes) {
      ctx.status = 429;
      ctx.body = {
        result: false,
        msg: `Too Many Requests: ${ctx.ip}`,
      };
    }
  };
}
