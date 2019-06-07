import Router from 'koa-router';
import { TRPGApplication } from 'trpg/core';
import { ChatEmotionItem } from '../models/item';
import auth from 'packages/File/lib/middleware/auth';
import upload from 'packages/File/lib/middleware/upload';
import sha256 from 'packages/File/lib/middleware/sha256';
import allowMIME from 'packages/File/lib/middleware/allowMIME';
import imageResize from 'packages/File/lib/middleware/imageResize';
import move from 'packages/File/lib/middleware/move';
import fileStorage from 'packages/File/lib/middleware/storage/file';
import { emotionsDir } from '../constant';

const router = new Router();

router.get('/getEmotionList', async (ctx) => {
  // const trpgapp = ctx.trpgapp as TRPGApplication;
  // const db = trpgapp.storage.db;

  const list = await ChatEmotionItem.findAll();
  console.log(ctx.request.href);

  ctx.body = list;
});

router.post(
  '/upload/item',
  auth(),
  upload(true).single('file'),
  allowMIME(['image/jpeg', 'image/gif', 'image/png']),
  move(emotionsDir),
  imageResize(256, 256),
  sha256(),
  fileStorage(true),
  async (ctx) => {
    const fileInfo = ctx.fileinfo;
    const fileId = fileInfo.id;
    const fileOriginalName = fileInfo.originalname;
    const uploadUrl = fileInfo.upload_url;
    const { name } = (ctx.req as any).body;

    const item = await ChatEmotionItem.create({
      name: name || fileOriginalName,
      url: uploadUrl,
      fileId,
    });

    ctx.body = item;
  }
);

export default router;
