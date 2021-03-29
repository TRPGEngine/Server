import _ from 'lodash';
import { ChatLog } from '../models/log';
import { TRPGRouter } from 'trpg/core';
import { PlayerJWTPayload } from 'packages/Player/types/player';
import { ssoAuth } from 'packages/Player/lib/middleware/auth';

const chatlogRouter = new TRPGRouter<{
  player?: PlayerJWTPayload;
}>();

/**
 * 用户添加表情包
 */
chatlogRouter.get('/log/:groupUUID', ssoAuth(), async (ctx) => {
  const playerUUID = ctx.state.player.uuid;
  const groupUUID = ctx.params.groupUUID;
  const keyword = ctx.query.keyword;

  if (_.isNil(playerUUID) || _.isNil(groupUUID)) {
    throw new Error('缺少必要参数');
  }

  if (String(keyword).length <= 3) {
    throw new Error('关键词过短, 请输入3个以上的关键字');
  }

  const logs = await ChatLog.searchGroupChatLogInDatabaseByMessage(
    groupUUID,
    keyword
  );

  ctx.body = { logs };
});

export default chatlogRouter;
