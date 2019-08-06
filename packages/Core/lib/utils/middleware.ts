/**
 * 判断是否为dev环境， 如果是dev环境则走到下一步
 * @param otherwise 否则 中间件
 */
export const isDev = (otherwise?): any => (ctx, next) => {
  if (ctx.trpgapp.get('env') === 'development') {
    return next();
  } else {
    if (otherwise) {
      return otherwise(ctx, next);
    } else {
      ctx.status = 403;
    }
  }
};
