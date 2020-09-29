import { TRPGRouter } from 'trpg/core';
import { PlayerJWTPayload } from 'packages/Player/types/player';
import _ from 'lodash';
import { GroupInviteCode } from '../models/invite-code';
import { ssoAuth } from 'packages/Player/lib/middleware/auth';

const inviteCodeRouter = new TRPGRouter<{
  player?: PlayerJWTPayload;
}>();

/**
 * 获取邀请码信息
 */
inviteCodeRouter.get('/invite/code/:inviteCode/info', async (ctx) => {
  const inviteCode: string = ctx.params.inviteCode;

  const invite = await GroupInviteCode.findByCode(inviteCode);
  ctx.body = { invite };
});

/**
 * 创建邀请码
 */
inviteCodeRouter.post('/invite/code/create', ssoAuth(), async (ctx) => {
  const playerUUID = ctx.state.player.uuid;
  const { groupUUID } = ctx.request.body;

  if (_.isNil(groupUUID) || _.isNil(playerUUID)) {
    throw new Error('缺少必要字段');
  }

  const invite = await GroupInviteCode.createInvite(groupUUID, playerUUID);
  ctx.body = { invite };
});

/**
 * 同意使用邀请码加入团
 */
inviteCodeRouter.post(
  '/invite/code/:inviteCode/apply',
  ssoAuth(),
  async (ctx) => {
    const inviteCode: string = ctx.params.inviteCode;
    const playerUUID = ctx.state.player.uuid;

    if (_.isNil(inviteCode) || _.isNil(playerUUID)) {
      throw new Error('缺少必要参数');
    }

    await GroupInviteCode.joinGroupWithCode(inviteCode, playerUUID);

    ctx.body = { result: true };
  }
);

export default inviteCodeRouter;
