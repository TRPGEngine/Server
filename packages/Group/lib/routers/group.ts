import { TRPGRouter } from 'trpg/core';
import { ssoAuth } from 'packages/Player/lib/middleware/auth';
import { PlayerJWTPayload } from 'packages/Player/types/player';
import _ from 'lodash';
import { PlayerUser } from 'packages/Player/lib/models/user';
import { GroupGroup } from '../models/group';
import { GroupRequest } from '../models/request';

const groupRouter = new TRPGRouter<{
  player?: PlayerJWTPayload;
}>();

groupRouter.get('/:groupUUID/info', async (ctx) => {
  const groupUUID = ctx.params.groupUUID;

  const group = await GroupGroup.findByUUID(groupUUID);

  ctx.body = { group };
});

/**
 * 获取用户拥有的所有团列表
 */
groupRouter.get('/list/own', ssoAuth(), async (ctx) => {
  const playerUUID = ctx.state.player.uuid;
  const user = await PlayerUser.findByUUID(playerUUID);
  if (_.isNil(user)) {
    throw new Error('用户不存在');
  }

  const groups = await user.getGroups({
    where: {
      owner_uuid: playerUUID,
    },
  });

  ctx.body = { groups };
});

/**
 * 创建团
 */
groupRouter.post('/create', ssoAuth(), async (ctx) => {
  const playerUUID = ctx.state.player.uuid;
  const { name, avatar, subName, desc } = ctx.request.body;

  const user = await PlayerUser.findByUUID(playerUUID);
  if (_.isNil(user)) {
    throw new Error('用户不存在');
  }

  const group = await GroupGroup.createGroup(
    name,
    avatar,
    subName,
    desc,
    user.uuid
  );

  ctx.body = { group };
});

/**
 * 将普通成员提升为管理员
 */
groupRouter.post('/setMemberToManager', ssoAuth(), async (ctx) => {
  const playerUUID = ctx.state.player.uuid;
  const { groupUUID, memberUUID } = ctx.request.body;

  if (_.isNil(groupUUID) || _.isNil(memberUUID)) {
    throw new Error('缺少必要参数');
  }

  const group = await GroupGroup.setMemberToManager(
    groupUUID,
    memberUUID,
    playerUUID
  );

  ctx.body = { group };
});

/**
 * 将管理员降级为普通成员
 */
groupRouter.post('/setManagerToMember', ssoAuth(), async (ctx) => {
  const playerUUID = ctx.state.player.uuid;
  const { groupUUID, memberUUID } = ctx.request.body;

  if (_.isNil(groupUUID) || _.isNil(memberUUID)) {
    throw new Error('缺少必要参数');
  }

  const group = await GroupGroup.setManagerToMember(
    groupUUID,
    memberUUID,
    playerUUID
  );

  ctx.body = { group };
});

/**
 * 将用户踢出
 */
groupRouter.post('/tickMember', ssoAuth(), async (ctx) => {
  const playerUUID = ctx.state.player.uuid;
  const { groupUUID, memberUUID } = ctx.request.body;

  if (_.isNil(groupUUID) || _.isNil(memberUUID)) {
    throw new Error('缺少必要参数');
  }

  await GroupGroup.tickMember(groupUUID, memberUUID, playerUUID);

  ctx.body = { result: true };
});

/**
 * 获取团请求列表
 */
groupRouter.get('/request/list', ssoAuth(), async (ctx) => {
  const playerUUID = ctx.state.player.uuid;
  const { groupUUID } = ctx.request.query;

  if (_.isNil(groupUUID)) {
    throw new Error('缺少必要参数');
  }

  const list = await GroupRequest.getGroupRequestList(groupUUID, playerUUID);

  ctx.body = { list };
});

/**
 * 同意入团请求
 */
groupRouter.post('/request/agree', ssoAuth(), async (ctx) => {
  const playerUUID = ctx.state.player.uuid;
  const { requestUUID } = ctx.request.body;

  if (_.isNil(requestUUID)) {
    throw new Error('缺少必要参数');
  }

  await GroupRequest.agreeGroupRequest(requestUUID, playerUUID);

  ctx.body = { result: true };
});

/**
 * 拒绝入团请求
 */
groupRouter.post('/request/refuse', ssoAuth(), async (ctx) => {
  const playerUUID = ctx.state.player.uuid;
  const { requestUUID } = ctx.request.body;

  if (_.isNil(requestUUID)) {
    throw new Error('缺少必要参数');
  }

  await GroupRequest.refuseGroupRequest(requestUUID, playerUUID);

  ctx.body = { result: true };
});

/**
 * 获取团队一定时间范围内所有的会话记录
 */
groupRouter.get('/log/:groupUUID/range', ssoAuth(), async (ctx) => {
  const groupUUID = ctx.params.groupUUID;
  const playerUUID = ctx.state.player.uuid;
  const { from, to } = ctx.request.query;
  if (_.isNil(from) || _.isNil(to)) {
    throw new Error('缺少必要参数');
  }

  const logs = await GroupGroup.getGroupRangeChatLog(
    groupUUID,
    playerUUID,
    from,
    to
  );

  ctx.body = { logs };
});

/**
 * 获取团队会话记录
 */
groupRouter.get('/log/:groupUUID', ssoAuth(), async (ctx) => {
  const groupUUID = ctx.params.groupUUID;
  const playerUUID = ctx.state.player.uuid;
  const { page = 1, size = 10 } = ctx.request.query;

  const { logs, count } = await GroupGroup.getGroupChatLog(
    groupUUID,
    playerUUID,
    Number(page),
    Number(size)
  );

  ctx.body = { logs, count };
});

export default groupRouter;
