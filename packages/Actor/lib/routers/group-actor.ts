import { TRPGRouter, ModelAccess } from 'trpg/core';
import { GroupActor } from '../models/group-actor';
import { ssoAuth, ssoInfo } from 'packages/Player/lib/middleware/auth';
import { PlayerJWTPayload } from 'packages/Player/types/player';
import _ from 'lodash';

const groupActorRouter = new TRPGRouter<{
  player?: PlayerJWTPayload;
}>();

/**
 * 团目前人物卡列表
 */
groupActorRouter.get('/:groupUUID/actor/list', async (ctx) => {
  const groupUUID = ctx.params.groupUUID;

  const actors = await GroupActor.findGroupActorsByUUID(groupUUID);

  ctx.body = { list: actors };
});

/**
 * 获取团角色详情
 */
groupActorRouter.get('/actor/detail/:groupActorUUID', async (ctx) => {
  const groupActorUUID = ctx.params.groupActorUUID;

  const groupActor = await GroupActor.getDetailByUUID(groupActorUUID);

  ctx.body = { groupActor };
});

/**
 * 获取团角色权限
 */
groupActorRouter.get(
  '/:groupUUID/actor/:groupActorUUID/access',
  ssoInfo(),
  async (ctx) => {
    const groupUUID = ctx.params.groupUUID;
    const groupActorUUID = ctx.params.groupActorUUID;
    const playerUUID = _.get(ctx, 'state.player.uuid');

    if (_.isEmpty(playerUUID)) {
      ctx.body = {
        access: {
          editable: false,
          removeable: false,
        } as ModelAccess,
      };
      return;
    }

    const access = await GroupActor.getAccess(
      groupUUID,
      groupActorUUID,
      playerUUID
    );

    ctx.body = { access };
  }
);

/**
 * 编辑团角色
 */
groupActorRouter.post(
  '/:groupUUID/actor/:groupActorUUID/edit',
  ssoAuth(),
  async (ctx) => {
    const groupActorUUID = ctx.params.groupActorUUID;
    const playerUUID = _.get(ctx.state, 'player.uuid');
    const { info } = ctx.request.body;

    if (_.isNil(groupActorUUID) || _.isNil(playerUUID)) {
      throw new Error('缺少必要字段');
    }

    const groupActor = await GroupActor.editActorInfo(
      groupActorUUID,
      info,
      playerUUID
    );

    ctx.body = { groupActor };
  }
);

/**
 * 删除团角色
 */
groupActorRouter.post(
  '/:groupUUID/actor/:groupActorUUID/remove',
  ssoAuth(),
  async (ctx) => {
    const groupActorUUID = ctx.params.groupActorUUID;
    const playerUUID = _.get(ctx.state, 'player.uuid');

    if (_.isNil(groupActorUUID) || _.isNil(playerUUID)) {
      throw new Error('缺少必要字段');
    }

    await GroupActor.remove(groupActorUUID, playerUUID);

    ctx.body = { result: true };
  }
);

/**
 * 申请团角色
 */
groupActorRouter.post('/:groupUUID/actor/apply', ssoAuth(), async (ctx) => {
  const groupUUID = ctx.params.groupUUID;
  const { actorUUID } = ctx.request.body;
  const playerUUID = _.get(ctx.state, 'player.uuid');

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
groupActorRouter.post('/:groupUUID/actor/agree', ssoAuth(), async (ctx) => {
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
groupActorRouter.post('/:groupUUID/actor/refuse', ssoAuth(), async (ctx) => {
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

export default groupActorRouter;
