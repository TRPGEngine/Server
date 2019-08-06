import { Middleware } from 'koa';
import _ from 'lodash';

type UserType = 'user' | 'admin';

export const auth = (allowType: UserType[] = []): Middleware => {
  return async (ctx, next) => {
    const token = ctx.headers['X-Token'] || '';
    const ret = await ctx.trpgapp.jwtVerify(token);

    if (allowType.includes(_.get(ret, 'type'))) {
      return next();
    } else {
      ctx.status = 403;
    }
  };
};
