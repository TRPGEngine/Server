import uuid from 'uuid/v1';
import { TRPGMiddleware } from 'trpg/core';
import _ from 'lodash';
import { FileChatimg } from '../../models/chatimg';

// TODO: 聊天的相关逻辑应转移到Chat模块。而不是在File模块
export default function chatimgStorage(): TRPGMiddleware {
  return async (ctx, next) => {
    const trpgapp = ctx.trpgapp;
    if (!ctx.player) {
      ctx.response.status = 403;
      throw '用户未找到，请检查登录状态';
    }

    const { filename, size, has_thumbnail, encoding, mimetype } = _.get(
      ctx,
      'req.file'
    );
    const chatimg = await FileChatimg.create({
      uuid: uuid(),
      name: filename,
      size,
      type: 'file',
      has_thumbnail,
      encoding,
      mimetype,
    });
    await chatimg.setOwner(ctx.player.user);
    ctx.chatimg = chatimg.getObject();

    return next();
  };
}
