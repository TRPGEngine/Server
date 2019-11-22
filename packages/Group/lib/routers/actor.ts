import { TRPGRouter } from 'trpg/core';
import { GroupGroup } from '../models/group';
import { GroupActor } from '../models/actor';
import { ssoAuth } from 'packages/Player/lib/middleware/auth';
import { PlayerJWTPayload } from 'packages/Player/types/player';
import _ from 'lodash';

const actorRouter = new TRPGRouter<{
  player?: PlayerJWTPayload;
}>();

/**
 * 团目前人物卡列表
 */
actorRouter.get('/:groupUUID/actor/list', async (ctx) => {
  const groupUUID = ctx.params.groupUUID;

  const actors = await GroupGroup.findGroupActorsByUUID(groupUUID);

  ctx.body = { list: actors };
});

actorRouter.post('/:groupUUID/actor/apply', ssoAuth(), async (ctx) => {
  const groupUUID = ctx.params.groupUUID;
  const { actorUUID } = ctx.request.body;
  const player = ctx.state.player;
  const playerUUID = player.uuid;

  if (_.isNil(groupUUID) || _.isNil(actorUUID) || _.isNil(playerUUID)) {
    throw new Error('缺少必要字段');
  }

  if (!_.isString(actorUUID)) {
    throw new Error('actorUUID 必须为字符串');
  }

  const actor = await GroupActor.addApprovalGroupActor(
    groupUUID,
    actorUUID,
    playerUUID
  );

  ctx.body = { actor };
});

export default actorRouter;
