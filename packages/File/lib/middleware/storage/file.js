const uuid = require('uuid/v1');
const path = require('path');

module.exports = function fileStorage(isPersistence = false, type = 'file') {
  return async (ctx, next) => {
    let trpgapp = ctx.trpgapp;
    if (!ctx.player) {
      ctx.response.status = 403;
      throw '用户未找到，请检查登录状态';
    }

    let {
      filename,
      originalname,
      size,
      encoding,
      mimetype,
      path: filepath,
    } = ctx.req.file;
    let db = await trpgapp.storage.db;

    if (path.isAbsolute(filepath)) {
      // 如果filepath是绝对路径，则转化为相对路径
      filepath = path.relative(process.cwd(), filepath);
    }

    let fileinfo = await db.models.file_file.create({
      uuid: uuid(),
      name: filename,
      originalname,
      size,
      encoding,
      mimetype,
      type,
      path: filepath,
      is_persistence: isPersistence,
      owner_uuid: ctx.player.user.uuid,
      ownerId: ctx.player.user.id,
    });
    ctx.fileinfo = fileinfo.getObject();

    await next();
  };
};
