import { TRPGRouter } from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';
import _ from 'lodash';
const userRouter = new TRPGRouter();

userRouter.get('/info/:uuid', async (ctx) => {
  const playerUUID = ctx.params.uuid;
  const user = await PlayerUser.findByUUID(playerUUID);

  ctx.body = { user };
});

userRouter.post('/register', async (ctx) => {
  const { username, password } = ctx.request.body;

  if (_.isNil(username) || _.isNil(password)) {
    throw new Error('缺少必要字段');
  }

  const results = await PlayerUser.registerUser(username, password);
  ctx.body = { results };
});

export default userRouter;
