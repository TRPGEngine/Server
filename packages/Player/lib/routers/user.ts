import { TRPGRouter } from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';
const userRouter = new TRPGRouter();

userRouter.get('/info/:uuid', async (ctx) => {
  const playerUUID = ctx.params.uuid;
  const user = await PlayerUser.findByUUID(playerUUID);

  ctx.body = { user };
});

export default userRouter;
