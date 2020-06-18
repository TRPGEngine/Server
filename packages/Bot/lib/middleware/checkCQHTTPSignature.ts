import { TRPGMiddleware } from 'trpg/core';
import _ from 'lodash';
import crypto from 'crypto';

/**
 * 校验CQHTTP签名信息
 */
export function checkCQHTTPSignature(): TRPGMiddleware {
  return (ctx, next) => {
    const robotQQ = ctx.headers['x-self-id'] ?? '';
    ctx.state.robotQQ = robotQQ;
    const signature = ctx.headers['x-signature'];

    const secret = ctx.trpgapp.get<string>('bot.qqbot.secret', '');

    if (_.isNil(signature)) {
      throw new Error('签名不存在');
    }

    const hmac = crypto.createHmac('sha1', secret);
    hmac.update(ctx.request.rawBody);
    const sig = hmac.digest('hex');

    if (signature !== `sha1=${sig}`) {
      throw new Error('签名不正确');
    }

    return next();
  };
}
