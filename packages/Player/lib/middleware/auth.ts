import { TRPGMiddleware } from 'trpg/core';
import _ from 'lodash';
import { PlayerJWTPayload } from 'packages/Player/types/player';

export const ssoAuth = (): TRPGMiddleware<{
  player: PlayerJWTPayload;
}> => async (ctx, next) => {
  const token: string = ctx.headers['X-Token'] || '';
  try {
    const ret = await ctx.trpgapp.jwtVerify(token);
    if (_.isObject(ret)) {
      const { uuid, name, avatar } = ret as PlayerJWTPayload;

      ctx.state.player = { uuid, name, avatar };
      await next();
    }
  } catch (e) {
    console.error(e);
    ctx.status = 401;
  }
};
