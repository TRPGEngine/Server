import { TRPGRouter } from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';
import _ from 'lodash';
import { PlayerLoginLog } from '../models/login-log';
import { PlayerJWTPayload } from 'packages/Player/types/player';
import { ssoAuth } from '../middleware/auth';
import { NotFoundError } from 'lib/error';

const userRouter = new TRPGRouter<{
  player?: PlayerJWTPayload;
}>();

/**
 * 返回用户信息
 */
userRouter.get('/info/:uuid', async (ctx) => {
  const playerUUID = ctx.params.uuid;
  const user = await PlayerUser.findByUUID(playerUUID);
  if (_.isNil(user)) {
    throw new NotFoundError(`该用户不存在: ${playerUUID}`);
  }

  ctx.body = { user: user.getInfo(false) };
});

userRouter.post('/register', async (ctx) => {
  const { username, password } = ctx.request.body;

  const results = await PlayerUser.registerUser(username, password, ctx.ip);
  ctx.body = { results };
});

/**
 * 获取用户个人的登录记录
 */
userRouter.get('/login/history/private', ssoAuth(), async (ctx) => {
  const player = ctx.state.player;

  if (_.isNil(player) || !_.isString(player.uuid)) {
    throw new Error('无法正确获取到用户信息');
  }

  // 只获取公开数据
  const logs = await PlayerLoginLog.getPrivatePlayerLoginLog(player.uuid);

  ctx.body = { logs };
});

userRouter.get('/login/history/:uuid', async (ctx) => {
  const playerUUID = ctx.params.uuid;

  // 只获取公开数据
  const logs = await PlayerLoginLog.getPublicPlayerLoginLog(playerUUID);

  ctx.body = { logs };
});

export default userRouter;
