const uuid = require('uuid/v1');

module.exports = function() {
  return async (ctx, next) => {
    let trpgapp = ctx.trpgapp;
    if(!ctx.player) {
      ctx.response.status = 403;
      throw '用户未找到，请检查登录状态';
    }

    let {filename, size, has_thumbnail, encoding, mimetype} = ctx.req.file;
    let db = await trpgapp.storage.db;
    let chatimg = await db.models.file_chatimg.create({
      uuid: uuid(),
      name: filename,
      size,
      type: 'file',
      has_thumbnail,
      encoding,
      mimetype,
    })
    await chatimg.setOwner(ctx.player.user);
    ctx.chatimg = chatimg.getObject();
  }
}
