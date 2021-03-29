import { TRPGRouter } from 'trpg/core';
import { PlayerJWTPayload } from 'packages/Player/types/player';
import _ from 'lodash';
import { ssoAuth } from 'packages/Player/lib/middleware/auth';
import { GroupInvite } from '../models/invite';

const inviteRouter = new TRPGRouter<{
  player?: PlayerJWTPayload;
}>();

/**
 * 获取所有团邀请列表
 */
inviteRouter.get('/invite/all', ssoAuth(), async (ctx) => {
  const playerUUID = ctx.state.player.uuid;

  const invites = await GroupInvite.getAllPendingInvites(playerUUID);
  ctx.body = { invites };
});

/**
 * 同意团邀请
 */
inviteRouter.post('/invite/:inviteUUID/agree', ssoAuth(), async (ctx) => {
  const playerUUID = ctx.state.player.uuid;
  const inviteUUID: string = ctx.params.inviteUUID;

  await GroupInvite.agreeInvite(inviteUUID, playerUUID);

  ctx.body = { result: true };
});

/**
 * 拒绝团邀请
 */
inviteRouter.post('/invite/:inviteUUID/refuse', ssoAuth(), async (ctx) => {
  const playerUUID = ctx.state.player.uuid;
  const inviteUUID: string = ctx.params.inviteUUID;

  await GroupInvite.refuseInvite(inviteUUID, playerUUID);

  ctx.body = { result: true };
});

export default inviteRouter;
