import Router from 'koa-router';
import upload from '../middleware/upload';
import sha265 from '../middleware/sha256';
import config from '../config';
const chatimgStorage = require('../middleware/storage/chatimg');
const auth = require('../middleware/auth');
import uuid from 'uuid/v1';
import _ from 'lodash';
import request from 'request';
import { TRPGApplication } from 'trpg/core';

let router = new Router();

router.post(
  '/upload',
  auth(),
  upload(config.path.chatimgDir).single('image') as any,
  sha265(),
  chatimgStorage(),
  async (ctx, next) => {
    const filename = _.get(ctx, 'req.file.filename');
    const size = _.get(ctx, 'req.file.size');
    const has_thumbnail = _.get(ctx, 'req.file.has_thumbnail', false);
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
  const { url, storename, width, height, size, hash, timestamp, ip } = body;
  const ext = {
    hash,
    timestamp,
    ip,
    delete: body.delete,
  };

  const db = await ctx.trpgapp.storage.db;
  const chatimg = await db.models.file_chatimg.create({
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

/**
 * 上传图片数据转发
 */
router.post('/forward', (ctx) => {
  const { req, res } = ctx;
  const trpgapp: TRPGApplication = ctx.trpgapp;

  const imagesUrl = trpgapp.get('file.forward.chatimg.url');
  const imagesHeaders = trpgapp.get('file.forward.chatimg.headers', {});

  if (!imagesUrl) {
    throw new Error('未配置转发服务');
  }

  return new Promise((resolve, reject) => {
    const imagesReq = request.post(
      imagesUrl,
      {
        headers: imagesHeaders,
      },
      (error, response, body) => {
        if (error) {
          trpgapp.error(error);

          res.statusCode = 503;
          res.end();
          reject();
          return;
        }

        ctx.body = body;
        resolve();
      }
    );

    req.pipe(imagesReq); // 将输入以流的形式转发到图片服务上
  });
});

module.exports = router;
