import { TRPGRouter } from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';
import _ from 'lodash';
import { PlayerLoginLog } from '../models/login-log';
const userRouter = new TRPGRouter();

userRouter.get('/info/:uuid', async (ctx) => {
  const playerUUID = ctx.params.uuid;
  const user = await PlayerUser.findByUUID(playerUUID);

  ctx.body = { user };
});

userRouter.post('/register', async (ctx) => {
  const { username, password } = ctx.request.body;

  const results = await PlayerUser.registerUser(username, password);
  ctx.body = { results };
});

userRouter.get('/login/history/:uuid', async (ctx) => {
  const playerUUID = ctx.params.uuid;

  // 只获取公开数据
  const logs = PlayerLoginLog.getPlayerLoginLog(playerUUID);

  ctx.body = { logs };
});

export default userRouter;
