import path from 'path';
import uuid from 'uuid/v1';
import { TRPGMiddleware } from 'trpg/core';
import _ from 'lodash';
import { FileFile } from '../../models/file';

export default function fileStorage(
  isPersistence = false,
  type = 'file'
): TRPGMiddleware {
  return async (ctx, next) => {
    const trpgapp = ctx.trpgapp;
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
    } = _.get(ctx, 'req.file');
    const db = await trpgapp.storage.db;

    if (path.isAbsolute(filepath)) {
      // 如果filepath是绝对路径，则转化为相对路径
      filepath = path.relative(process.cwd(), filepath);
    }

    const fileinfo = await FileFile.create({
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
}
