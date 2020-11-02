import { TRPGRouter } from 'trpg/core';
import _ from 'lodash';
import { ssoAuth } from 'packages/Player/lib/middleware/auth';
import { PlayerJWTPayload } from 'packages/Player/types/player';
import { BotApp } from '../models/app';
const appRouter = new TRPGRouter<{
  player?: PlayerJWTPayload;
}>();

appRouter.post('/app/create', ssoAuth(), async (ctx) => {
  const playerUUID = ctx.state.player.uuid;
  const { name, desc, website, ip_whitelist } = ctx.request.body;

  if (_.isNil(name)) {
    throw new Error('缺少必要参数');
  }

  const bot = await BotApp.createBotApp(
    playerUUID,
    ctx.ip,
    name,
    desc,
    website,
    ip_whitelist
  );

  ctx.body = { result: true, bot };
});

export default appRouter;
