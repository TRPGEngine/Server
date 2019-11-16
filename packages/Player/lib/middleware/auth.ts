import { TRPGMiddleware } from 'trpg/core';
import _ from 'lodash';
import { PlayerJWTPayload } from 'packages/Player/types/player';

// 该错误需要登录
class UnauthorizedError extends Error {
  name: 'Unauthorized';
}

export const ssoAuth = (): TRPGMiddleware<{
  player: PlayerJWTPayload;
}> => async (ctx, next) => {
  const token: string = ctx.headers['x-token'] || '';
  try {
    if (_.isEmpty(token)) {
      throw new UnauthorizedError('Token 不存在');
    }

    const ret = await ctx.trpgapp.jwtVerify(token);
    if (!_.isNil(ret) && _.isObject(ret)) {
      const { uuid, name, avatar } = ret as PlayerJWTPayload;

      ctx.state.player = { uuid, name, avatar };
      await next();
    } else {
      throw new UnauthorizedError('Token解析失败');
    }
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      if (_.isError(e)) {
        console.error(e.message);
      } else {
        console.error(e);
      }
      ctx.status = 401;
    } else {
      throw e;
    }
  }
};
