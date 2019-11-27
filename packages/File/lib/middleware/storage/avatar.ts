import { TRPGMiddleware } from 'trpg/core';
import _ from 'lodash';
import { FileAvatar } from '../../models/avatar';

/**
 * 需要在upload中间件之后使用
 */
export default function avatarStorage(): TRPGMiddleware {
  return async (ctx, next) => {
    const trpgapp = ctx.trpgapp;
    if (!ctx.player) {
      ctx.response.status = 403;
      throw '用户未找到，请检查登录状态';
    }

    const filename = _.get(ctx.req, 'file.filename');
    const size = _.get(ctx.req, 'file.size');
    const has_thumbnail = _.get(ctx.req, 'file.has_thumbnail', false);
    const type = ctx.header['avatar-type'] || 'actor';
    const { width, height } = ctx.header;
    const db = trpgapp.storage.db;
    const attach_uuid: string = ctx.header['attach-uuid'] || null;
    await db.transactionAsync(async () => {
      if (attach_uuid) {
        // attach_uuid应唯一:一个用户只能有一个对应的头像文件、一个角色只能有一个对应的图片
        // 没有attach_uuid的文件会被定时删除
        let oldAvatars = await FileAvatar.findAll({
          where: { attach_uuid, type },
        });
        for (let oldAvatar of oldAvatars) {
          oldAvatar.attach_uuid = null;
          await oldAvatar.save();
        }
      }
      const avatar = await FileAvatar.create({
        name: filename,
        size,
        type,
        attach_uuid,
        width,
        height,
        has_thumbnail,
        owner_uuid: ctx.player.user.uuid,
        ownerId: ctx.player.user.id,
      });
      ctx.avatar = avatar.getObject();
    });

    return next();
  };
}
