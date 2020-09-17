import { TRPGRouter } from 'trpg/core';
import _ from 'lodash';
import { BotMsgToken } from '../models/msg-token';
const msgRouter = new TRPGRouter();

msgRouter.post('/msg/token/create', async (ctx) => {
  const { name, group_uuid, channel_uuid } = ctx.body;

  if (_.isNil(name) || _.isNil(group_uuid)) {
    throw new Error('缺少必要参数');
  }

  const bot = await BotMsgToken.createMsgToken(name, group_uuid, channel_uuid);

  ctx.body = { result: true, bot };
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
