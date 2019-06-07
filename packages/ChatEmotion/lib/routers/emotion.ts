import Router from 'koa-router';
import { TRPGApplication } from 'trpg/core';
import { ChatEmotionItem } from '../models/item';
import auth from 'packages/File/lib/middleware/auth';
import upload from 'packages/File/lib/middleware/upload';
import sha256 from 'packages/File/lib/middleware/sha256';
import fileStorage from 'packages/File/lib/middleware/storage/file';

const router = new Router();

router.get('/getEmotionList', async (ctx) => {
  // const trpgapp = ctx.trpgapp as TRPGApplication;
  // const db = trpgapp.storage.db;

  const list = await ChatEmotionItem.findAll();
  console.log(ctx.request.href);

  ctx.body = list;
});

router.post(
  '/upload',
  auth(),
  upload(true).single('file'),
  // TODO: allow mimetype
  // TODO: image resize
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
