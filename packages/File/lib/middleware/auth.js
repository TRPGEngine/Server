module.exports = function() {
  return async (ctx, next) => {
    let trpgapp = ctx.trpgapp;

    // TODO: 目前先基于header的user-uuid 之后改成jwt校验防止伪造
    let user_uuid = ctx.request.header['user-uuid'];
    if (!user_uuid) {
      ctx.response.status = 403;
      throw '缺少必要参数';
    }

    const player = trpgapp.player.manager.findPlayerByUUID(user_uuid); // TODO: 此处需要检查
    if (!player) {
      ctx.response.status = 403;
      throw '用户不在线，请检查登录状态';
    } else {
      ctx.player = player;
      return next();
    }
  };
};
