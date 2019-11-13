import { TRPGRouter } from 'trpg/core';
import { ssoAuth } from 'packages/Player/lib/middleware/auth';
import { PlayerJWTPayload } from 'packages/Player/types/player';
import { PlayerUser } from 'packages/Player/lib/models/user';
import _ from 'lodash';

const actorRouter = new TRPGRouter<{
  player?: PlayerJWTPayload;
}>();

actorRouter.get('/list', ssoAuth(), async (ctx) => {
  const playerInfo = ctx.state.player;

  const user = await PlayerUser.findByUUID(playerInfo.uuid);
  const actors = await _.invoke(user, 'getActors');

  ctx.body = { list: actors };
});

export default actorRouter;
