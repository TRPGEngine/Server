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

/**
 * 申请团角色
 */
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

/**
 * 同意团角色的申请
 */
actorRouter.post('/:groupUUID/actor/agree', ssoAuth(), async (ctx) => {
  const groupUUID = ctx.params.groupUUID;
  const { groupActorUUID } = ctx.request.body;
  const player = ctx.state.player;
  const playerUUID = player.uuid;

  if (_.isNil(groupUUID) || _.isNil(groupActorUUID) || _.isNil(playerUUID)) {
    throw new Error('缺少必要字段');
  }

  if (!_.isString(groupActorUUID)) {
    throw new Error('groupActorUUID 必须为字符串');
  }

  const groupActor = await GroupActor.agreeApprovalGroupActor(
    groupActorUUID,
    playerUUID
  );

  ctx.body = { groupActor };
});

/**
 * 拒绝团角色申请
 */
actorRouter.post('/:groupUUID/actor/refuse', ssoAuth(), async (ctx) => {
  const groupUUID = ctx.params.groupUUID; // 这个参数暂时没有用
  const { groupActorUUID } = ctx.request.body;
  const player = ctx.state.player;
  const playerUUID = player.uuid;

  if (_.isNil(groupUUID) || _.isNil(groupActorUUID) || _.isNil(playerUUID)) {
    throw new Error('缺少必要字段');
  }

  if (!_.isString(groupActorUUID)) {
    throw new Error('groupActorUUID 必须为字符串');
  }

  await GroupActor.refuseApprovalGroupActor(groupActorUUID, playerUUID);

  ctx.body = {
    result: true,
  };
});

export default actorRouter;
