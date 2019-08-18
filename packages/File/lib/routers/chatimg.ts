import Router from 'koa-router';
import upload from '../middleware/upload';
import sha265 from '../middleware/sha256';
const config = require('../config');
const chatimgStorage = require('../middleware/storage/chatimg')();
const auth = require('../middleware/auth');
import uuid from 'uuid/v1';
import _ from 'lodash';

let router = new Router();

router.post(
  '/upload',
  auth(),
  upload(config.path.chatimgDir).single('image') as any,
  sha265(),
  chatimgStorage,
  async (ctx, next) => {
    let filename = _.get(ctx, 'req.file.filename');
    let size = _.get(ctx, 'req.file.size');
    let has_thumbnail = _.get(ctx, 'req.file.has_thumbnail', false);
    ctx.body = {
      filename,
      url: has_thumbnail
        ? '/trpg-chat-image/thumbnail/' + filename
        : '/trpg-chat-image/' + filename,
      size,
      chatimg: ctx.chatimg,
    };
  }
);

// 基于https://sm.ms/api/upload接口的数据存储
router.post('/smms', auth(), async (ctx, next) => {
  const body = _.get(ctx, 'request.body');
  let { url, storename, width, height, size, hash, timestamp, ip } = body;
  let ext = {
    hash,
    timestamp,
    ip,
    delete: body.delete,
  };

  const db = await ctx.trpgapp.storage.db;
  let chatimg = await db.models.file_chatimg.create({
    uuid: uuid(),
    name: storename,
    url,
    size,
    width,
    height,
    type: 'url',
    has_thumbnail: false,
    ext,
    ownerId: ctx.player.user.id,
  });
  ctx.body = {
    chatimg: chatimg.getObject(),
  };
});

module.exports = router;
