import _ from 'lodash';
import { ChatLog } from '../models/log';
import { TRPGRouter } from 'trpg/core';
import { PlayerJWTPayload } from 'packages/Player/types/player';
import { ssoAuth } from 'packages/Player/lib/middleware/auth';

const chatlogRouter = new TRPGRouter<{
  player?: PlayerJWTPayload;
}>();

/**
 * 搜索群组聊天记录
 * 根据会话消息来搜索
 */
chatlogRouter.get(
  '/log/converse/:converseUUID/search',
  ssoAuth(),
  async (ctx) => {
    const playerUUID = ctx.state.player.uuid;
    const converseUUID = ctx.params.converseUUID;
    const keyword = ctx.query.keyword as string;

    const page = Number(ctx.query.page ?? 1);
    const size = Number(ctx.query.size ?? 10);

    if (_.isNil(converseUUID)) {
      throw new Error('缺少必要参数');
    }

    if (String(keyword).length <= 3) {
      throw new Error('关键词过短, 请输入3个以上的关键字');
    }

    const logs = await ChatLog.searchConverseChatLogInDatabaseByMessage(
      converseUUID,
      keyword,
      page,
      size
    );

    ctx.body = { logs };
  }
);

export default chatlogRouter;
