const Router = require('koa-router');
const fs = require('fs-extra');
const avatar = require('../middleware/avatar');
const avatarStorage = require('../middleware/storage')();
const avatarProcess = require('../middleware/process')();
const auth = require('../middleware/auth')();
const utils = require('../utils');
const config = require('../config');

let router = new Router();

router.post('/', auth, avatar.single('avatar'), avatarProcess, avatarStorage, async (ctx, next) => {
  let filename = ctx.req.file.filename;
  let size = ctx.req.file.size;
  let has_thumbnail = ctx.req.file.has_thumbnail;
  ctx.body = {
    filename,
    url: has_thumbnail ? '/avatar/thumbnail/' + filename : '/avatar/' + filename,
    avatar: ctx.avatar,
    size,
  }
})

router.get('/svg', async (ctx, next) => {
  let name = ctx.query.name;
  if (!name) {
    ctx.body = 'need name';
    return;
  }
  let nameid = utils.encodeStr2Int(name);
  let shortName = name[0].toUpperCase();
  let width = 100;
  let height = 100;
  let color = config.svgBg[nameid % config.svgBg.length];
  ctx.set('Cache-Control', 'max-age=604800'); // 缓存7天
  ctx.type = 'image/svg+xml';
  ctx.body = `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="${width}px" height="${height}px" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <rect width="${width}" height="${height}" fill="${color}"/>
    <text x="${width/2}px" y="${height/2 + 4}px" fill="#fff" style="font-size: 46px;" text-anchor="middle" dominant-baseline="middle">${shortName}</text>
  </svg>`;
})

module.exports = router;
