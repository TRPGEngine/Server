import upload from '../middleware/upload';
import sha256 from '../middleware/sha256';
import thumbnail from '../middleware/thumbnail';
import allowMIME from '../middleware/allow-mime';
import _ from 'lodash';
import { encodeStr2Int } from '../utils';
import config from '../config';
import auth from '../middleware/auth';
import { TRPGRouter } from 'trpg/core';
import avatarStorage from '../middleware/storage/avatar';
import { ssoAuth } from 'packages/Player/lib/middleware/auth';
import { PlayerJWTPayload } from 'packages/Player/types/player';
import { FileAvatar } from '../models/avatar';

const avatarRouter = new TRPGRouter<{
  player?: PlayerJWTPayload;
}>();

/**
 * 需要参数:
 * head:
 *  - user-uuid
 *  - avatar-type
 *  - attach-uuid
 * field:
 *  - avatar: file
 */
avatarRouter.post(
  '/',
  auth(),
  upload('public/avatar/').single('avatar') as any,
  allowMIME(['image/jpeg', 'image/png']),
  sha256(),
  thumbnail(128, 128),
  avatarStorage(),
  async (ctx, next) => {
    const filename = _.get(ctx, 'req.file.filename');
    const size = _.get(ctx, 'req.file.size');
    const has_thumbnail = _.get(ctx, 'req.file.has_thumbnail', false);

    ctx.body = {
      filename,
      url: has_thumbnail
        ? '/avatar/thumbnail/' + filename
        : '/avatar/' + filename,
      avatar: _.get(ctx, 'avatar'),
      uuid: _.get(ctx, 'avatar.uuid'),
      size,
    };
  }
);

avatarRouter.post('/bindAttachUUID', ssoAuth(), async (ctx) => {
  const player = ctx.state.player;
  const { avatarUUID, attachUUID } = ctx.request.body;

  if (!avatarUUID || !attachUUID) {
    throw new Error('缺少必要参数');
  }

  const avatar = await FileAvatar.bindAttachUUID(
    avatarUUID,
    attachUUID,
    player.uuid
  );

  ctx.body = { avatar };
});

avatarRouter.get('/svg', async (ctx, next) => {
  let name = ctx.query.name;
  if (!name) {
    ctx.body = 'need name';
    return;
  }
  let nameid = encodeStr2Int(name);
  let shortName = name[0].toUpperCase();
  let width = 100;
  let height = 100;
  let color = config.svgBg[nameid % config.svgBg.length];
  ctx.set('Cache-Control', 'max-age=604800'); // 缓存7天
  ctx.type = 'image/svg+xml';
  ctx.body = `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="${width}px" height="${height}px" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <rect width="${width}" height="${height}" fill="${color}"/>
    <text x="${width / 2}px" y="${height / 2 +
    4}px" fill="#fff" style="font-size: 46px;" text-anchor="middle" dominant-baseline="middle">${shortName}</text>
  </svg>`;
});

module.exports = avatarRouter;
