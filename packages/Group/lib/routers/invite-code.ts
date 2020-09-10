import { TRPGRouter } from 'trpg/core';
import { PlayerJWTPayload } from 'packages/Player/types/player';
import _ from 'lodash';
import { GroupInviteCode } from '../models/invite-code';
import { ssoAuth } from 'packages/Player/lib/middleware/auth';

const inviteCodeRouter = new TRPGRouter<{
  player?: PlayerJWTPayload;
}>();

/**
 * 获取团队会话记录
 */
inviteCodeRouter.get('/invite/code/:inviteCode/info', async (ctx) => {
  const inviteCode: string = ctx.params.inviteCode;

  const invite = await GroupInviteCode.findByCode(inviteCode);
  ctx.body = { invite };
});

/**
 * 同意加入团
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
