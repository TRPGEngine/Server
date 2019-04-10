const uuid = require('uuid/v1');

module.exports = function(isPersistence = false) {
  return async (ctx, next) => {
    let trpgapp = ctx.trpgapp;
    if(!ctx.player) {
      ctx.response.status = 403;
      throw '用户未找到，请检查登录状态';
    }

    let {filename, originalname, size, encoding, mimetype} = ctx.req.file;
    let db = await trpgapp.storage.db;

    let fileinfo = await db.models.file_file.create({
      uuid: uuid(),
      name: filename,
      originalname,
      size,
      encoding,
      mimetype,
      type: 'file',
      is_persistence: isPersistence,
      owner_uuid: ctx.player.user.uuid,
      ownerId: ctx.player.user.id
    })
    ctx.fileinfo = fileinfo.getObject();

    await next();
  }
}
