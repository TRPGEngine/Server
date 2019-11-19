import { TRPGRouter } from 'trpg/core';
import { GroupGroup } from '../models/group';

const actorRouter = new TRPGRouter();

/**
 * 团目前人物卡列表
 */
actorRouter.get('/:groupUUID/actor/list', async (ctx) => {
  const groupUUID = ctx.params.groupUUID;

  const actors = await GroupGroup.findGroupActorsByUUID(groupUUID);

  ctx.body = { list: actors };
});

export default actorRouter;
