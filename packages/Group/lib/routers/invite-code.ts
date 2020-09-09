import { TRPGRouter } from 'trpg/core';
import { PlayerJWTPayload } from 'packages/Player/types/player';
import _ from 'lodash';
import { GroupInviteCode } from '../models/invite-code';

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

export default inviteCodeRouter;
