import Router from 'koa-router';
import { TRPGApplication, Op } from 'trpg/core';
import _ from 'lodash';
import auth from 'packages/File/lib/middleware/auth';
import upload from 'packages/File/lib/middleware/upload';
import sha256 from 'packages/File/lib/middleware/sha256';
import allowMIME from 'packages/File/lib/middleware/allowMIME';
import imageResize from 'packages/File/lib/middleware/imageResize';
import move from 'packages/File/lib/middleware/move';
import fileStorage from 'packages/File/lib/middleware/storage/file';
import { emotionsDir } from '../constant';
import { ChatEmotionCatalog } from '../models/catalog';
import { ChatEmotionItem } from '../models/item';

const router = new Router();

/**
 * 用户添加表情包
 */
router.post('/usermap/addCatalog', auth(), async (ctx) => {
  const player = ctx.player;
  const { uuid } = ctx.request.body;

  const catalog = await ChatEmotionCatalog.findOne({ where: { uuid } });
  const db = ctx.trpgapp.storage.db;
  const User = db.models.player_user;
  const user = await User.findByPk(player.user.id);
  await user.addEmotionCatalog(catalog);

  ctx.body = { catalog };
});

export default router;
