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
  const { name, groupUUID, channelUUID } = ctx.request.body;

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

msgRouter.post('/msg/token/delete', ssoAuth(), async (ctx) => {
  const playerUUID = ctx.state.player.uuid;
  const { groupUUID, botUUID } = ctx.request.body;

  await BotMsgToken.removeMsgToken(groupUUID, botUUID, playerUUID);

  ctx.body = { result: true };
});

msgRouter.get('/msg/token/list', ssoAuth(), async (ctx) => {
  const playerUUID = ctx.state.player.uuid;
  const { groupUUID } = ctx.query;

  if (_.isNil(groupUUID)) {
    throw new Error('缺少必要参数');
  }

  const list = await BotMsgToken.getMsgTokenList(
    groupUUID as string,
    playerUUID
  );

  ctx.body = { list };
});

msgRouter.get('/msg/send', async (ctx) => {
  const { token, msg } = ctx.query;

  if (_.isNil(token)) {
    throw new Error('缺少必要参数');
  }

  await BotMsgToken.sendMsgWithToken(token as string, msg as string);

  ctx.body = { result: true, msg: '消息发送成功' };
});

msgRouter.post('/msg/send', async (ctx) => {
  const { token } = ctx.query;
  const { msg, data } = ctx.request.body;

  if (_.isNil(token)) {
    throw new Error('缺少必要参数');
  }

  await BotMsgToken.sendMsgWithToken(token as string, msg, data);

  ctx.body = { result: true, msg: '消息发送成功' };
});

export default msgRouter;
