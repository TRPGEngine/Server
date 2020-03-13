import { TRPGRouter } from 'trpg/core';
import { ssoAuth } from 'packages/Player/lib/middleware/auth';
import { PlayerJWTPayload } from 'packages/Player/types/player';
import _ from 'lodash';
import { PlayerUser } from 'packages/Player/lib/models/user';
import { GroupGroup } from '../models/group';

const groupRouter = new TRPGRouter<{
  player?: PlayerJWTPayload;
}>();

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
 * 获取团队会话记录
 */
groupRouter.get('/log/:groupUUID', ssoAuth(), async (ctx) => {
  const groupUUID = ctx.params.groupUUID;
  const playerUUID = ctx.state.player.uuid;
  const { from, to } = ctx.request.query;
  if (_.isNil(from) || _.isNil(to)) {
    throw new Error('缺少必要参数');
  }

  const logs = await GroupGroup.getGroupChatLog(
    groupUUID,
    playerUUID,
    from,
    to
  );

  ctx.body = { logs };
});

export default groupRouter;
