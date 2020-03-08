import { TRPGRouter, ModelAccess } from 'trpg/core';
import { ssoAuth, ssoInfo } from 'packages/Player/lib/middleware/auth';
import { PlayerJWTPayload } from 'packages/Player/types/player';
import { PlayerUser } from 'packages/Player/lib/models/user';
import _ from 'lodash';
import { ActorActor } from '../models/actor';

const actorRouter = new TRPGRouter<{
  player?: PlayerJWTPayload;
}>();

actorRouter.get('/list', ssoAuth(), async (ctx) => {
  const playerInfo = ctx.state.player;

  const user = await PlayerUser.findByUUID(playerInfo.uuid);
  const actors = await _.invoke(user, 'getActors');

  ctx.body = { list: actors };
});

actorRouter.post('/create', ssoAuth(), async (ctx) => {
  const playerInfo = ctx.state.player;
  const { name, desc, avatar, templateUUID, actorInfo } = ctx.request.body;

  if (!name || !templateUUID) {
    throw new Error('缺少必要字段');
  }

  if (!_.isObject(actorInfo)) {
    throw new Error('人物卡数据格式不正确');
  }

  const user = await PlayerUser.findByUUID(playerInfo.uuid);

  const actor: ActorActor = await ActorActor.create({
    name,
    desc,
    avatar,
    template_uuid: templateUUID,
    info: actorInfo,
  });
  await actor.setOwner(user);

  ctx.body = { actor };
});

actorRouter.get('/:actorUUID/detail', async (ctx) => {
  const actorUUID = ctx.params.actorUUID;

  const actor = await ActorActor.findByUUID(actorUUID);

  ctx.body = { actor };
});

actorRouter.post('/:actorUUID/edit', ssoAuth(), async (ctx) => {
  const actorUUID = ctx.params.actorUUID;
  const { name, desc, avatar, info } = ctx.request.body;
  const { uuid: userUUID } = ctx.state.player;

  // 仅自己可以修改
  const user = await PlayerUser.findByUUID(userUUID);
  const actor: ActorActor = await ActorActor.findOne({
    where: {
      uuid: actorUUID,
      ownerId: user.id,
    },
  });

  if (_.isNil(actor)) {
    throw new Error('角色不存在');
  }

  if (_.isString(name) && name !== '') {
    actor.name = name;
  }
  if (_.isString(desc)) {
    actor.desc = desc;
  }
  if (_.isString(avatar)) {
    actor.avatar = avatar;
  }
  if (!_.isEmpty(info)) {
    actor.info = _.merge(_.cloneDeep(actor.info), info);
  }

  await actor.save();

  ctx.body = {
    actor,
  };
});

actorRouter.post('/:actorUUID/remove', ssoAuth(), async (ctx) => {
  const actorUUID = ctx.params.actorUUID;
  const playerUUID = _.get(ctx.state, 'player.uuid');

  if (_.isNil(actorUUID) || _.isNil(playerUUID)) {
    throw new Error('缺少必要字段');
  }

  await ActorActor.remove(actorUUID, playerUUID);

  ctx.body = { result: true };
});

actorRouter.get('/:actorUUID/access', ssoInfo(), async (ctx) => {
  const actorUUID = ctx.params.actorUUID;

  if (_.isNil(ctx.state.player)) {
    ctx.body = {
      access: {
        editable: false,
        removeable: false,
      } as ModelAccess,
    };

    return;
  }

  const actor = await ActorActor.findByUUID(actorUUID);
  const owner: PlayerUser = await actor.getOwner();

  if (owner.uuid === _.get(ctx.state, 'player.uuid')) {
    ctx.body = {
      access: {
        editable: true,
        removeable: true,
      } as ModelAccess,
    };
  } else {
    ctx.body = {
      access: {
        editable: false,
        removeable: false,
      } as ModelAccess,
    };
  }
});

/**
 * 分享人物卡
 */
actorRouter.post('/share', ssoAuth(), async (ctx) => {
  const { uuid: playerUUID } = ctx.state.player;
  const { actorUUID } = ctx.request.body;
  if (_.isNil(actorUUID)) {
    throw new Error('缺少必要参数');
  }

  await ActorActor.shareActor(actorUUID, playerUUID);

  ctx.body = {
    result: true,
  };
});

/**
 * 取消分享人物卡
 */
actorRouter.post('/unshare', ssoAuth(), async (ctx) => {
  const { uuid: playerUUID } = ctx.state.player;
  const { actorUUID } = ctx.request.body;
  if (_.isNil(actorUUID)) {
    throw new Error('缺少必要参数');
  }

  await ActorActor.unshareActor(actorUUID, playerUUID);

  ctx.body = {
    result: true,
  };
});

/**
 * fork人物卡
 */
actorRouter.post('/fork', ssoAuth(), async (ctx) => {
  const { uuid: playerUUID } = ctx.state.player;
  const { targetActorUUID } = ctx.request.body;
  if (_.isNil(targetActorUUID)) {
    throw new Error('缺少必要参数');
  }

  await ActorActor.forkActor(targetActorUUID, playerUUID);

  ctx.body = {
    result: true,
  };
});

actorRouter.get('/findAllSharedActor', async (ctx) => {
  const actors = await ActorActor.findSharedActor(); // 搜索所有

  ctx.body = {
    actors,
  };
});

export default actorRouter;
