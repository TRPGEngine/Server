import Router from 'koa-router';
import upload from '../middleware/upload';
import sha256 from '../middleware/sha256';
import thumbnail from '../middleware/thumbnail';
import allowMIME from '../middleware/allow-mime';
import _ from 'lodash';
import { encodeStr2Int } from '../utils';
import config from '../config';
const avatarStorage = require('../middleware/storage/avatar');
const auth = require('../middleware/auth');

let router = new Router();

router.post(
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
      avatar: ctx.avatar,
      size,
    };
  }
);

router.get('/svg', async (ctx, next) => {
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

module.exports = router;
