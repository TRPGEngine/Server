import { TRPGMiddleware } from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';

/**
 * @deprecated 使用ssoAuth
 */
export default function auth(): TRPGMiddleware {
  return async (ctx, next) => {
    const trpgapp = ctx.trpgapp;

    // TODO: 目前先基于header的user-uuid 之后改成jwt校验防止伪造
    const user_uuid = ctx.request.header['user-uuid'];
    if (!user_uuid) {
      ctx.response.status = 403;
      throw new Error('缺少必要参数');
    }

    const player = trpgapp.player.manager.findPlayerWithUUID(user_uuid); // TODO: 此处需要检查
    if (!player) {
      ctx.response.status = 403;
      throw new Error('用户不在线，请检查登录状态');
    } else {
      const user = await PlayerUser.findByUUID(user_uuid);
      ctx.player = { ...player, user };
      return next();
    }
  };
}
