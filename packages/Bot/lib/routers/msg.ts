import { TRPGRouter } from 'trpg/core';
import _ from 'lodash';
import { BotMsgToken } from '../models/msg-token';
import { ssoAuth } from 'packages/Player/lib/middleware/auth';
import { PlayerJWTPayload } from 'packages/Player/types/player';
const msgRouter = new TRPGRouter<{
  player?: PlayerJWTPayload;
}>();

msgRouter.post('/msg/token/create', ssoAuth(), async (ctx) => {
  const playerUUID = ctx.state.player.uuid;
  const { name, groupUUID, channelUUID } = ctx.body;

  if (_.isNil(name) || _.isNil(groupUUID)) {
    throw new Error('缺少必要参数');
  }

  const bot = await BotMsgToken.createMsgToken(
    name,
    groupUUID,
    channelUUID,
    playerUUID
  );

  ctx.body = { result: true, bot };
});

msgRouter.get('/msg/token/list', ssoAuth(), async (ctx) => {
  const playerUUID = ctx.state.player.uuid;
  const { groupUUID } = ctx.body;

  if (_.isNil(groupUUID)) {
    throw new Error('缺少必要参数');
  }

  const list = await BotMsgToken.getMsgTokenList(groupUUID, playerUUID);

  ctx.body = { list };
});

msgRouter.get('/msg/send', async (ctx) => {
  const { token, msg } = ctx.query;

  if (_.isNil(token)) {
    throw new Error('缺少必要参数');
  }

  await BotMsgToken.sendMsgWithToken(token, msg);

  ctx.body = { result: true };
});

msgRouter.post('/msg/send', async (ctx) => {
  const { token } = ctx.query;
  const { msg, data } = ctx.body;

  if (_.isNil(token)) {
    throw new Error('缺少必要参数');
  }

  await BotMsgToken.sendMsgWithToken(token, msg, data);

  ctx.body = { result: true };
});

export default msgRouter;
