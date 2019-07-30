import Router from 'koa-router';
import { TRPGApplication, Op } from 'trpg/core';
import _ from 'lodash';
import auth from 'packages/File/lib/middleware/auth';
import upload from 'packages/File/lib/middleware/upload';
import sha256 from 'packages/File/lib/middleware/sha256';
import allowMIME from 'packages/File/lib/middleware/allow-mime';
import imageResize from 'packages/File/lib/middleware/image-resize';
import move from 'packages/File/lib/middleware/move';
import fileStorage from 'packages/File/lib/middleware/storage/file';
import { emotionsDir } from '../constant';
import { ChatEmotionCatalog } from '../models/catalog';
import { ChatEmotionItem } from '../models/item';
import { ChatEmotionSecretSignal } from '../models/secret-signal';

const router = new Router();

router.get('/getEmotionList', async (ctx) => {
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
  fileStorage(true, 'emotion'),
  async (ctx) => {
    const playerId = _.get(ctx, 'player.user.id');
    const fileInfo = ctx.fileinfo;
    const fileId = fileInfo.id;
    const fileOriginalName = fileInfo.originalname;
    const uploadUrl = fileInfo.upload_url;
    const { name } = (ctx.req as any).body;

    const item = await ChatEmotionItem.create({
      name: name || fileOriginalName,
      url: uploadUrl,
      fileId,
      ownerId: playerId,
    });

    ctx.body = item;
  }
);

// 获取表情包列表
router.get('/catalog/get', async (ctx) => {
  const name = ctx.request.query.name;
  if (!name) {
    throw new Error('缺少必要字段');
  }

  const catalog = await ChatEmotionCatalog.findOne({
    where: {
      name,
    },
    order: [['id', 'DESC']],
    include: [{ model: ChatEmotionItem, as: 'items' }],
  });

  ctx.body = { catalog };
});

// 表情包生成
router.post('/catalog/create', auth(), async (ctx) => {
  const name: string = _.get(ctx, 'request.body.name');
  const items: string[] = _.get(ctx, 'request.body.items', []); // item uuid update
  const playerId = _.get(ctx, 'player.user.id');

  if (!name || !items) {
    throw new Error('缺少必要字段');
  }

  // TODO: 事务
  const catalog: ChatEmotionCatalog = await ChatEmotionCatalog.create({
    name,
    ownerId: playerId,
  });
  const [number] = await ChatEmotionItem.update(
    {
      catalogId: catalog.id,
    },
    {
      where: {
        uuid: {
          [Op.in]: items,
        },
        ownerId: playerId,
      },
    }
  );

  ctx.body = { catalog, number };
});

// 新增表情包暗号
router.post('/catalog/secretSignal/create', auth(), async (ctx) => {
  const catalogUUID = _.get(ctx, 'request.body.catalogUUID');
  const playerId = _.get(ctx, 'player.user.id');

  const catalog = await ChatEmotionCatalog.findOne({
    attributes: ['id'],
    where: { uuid: catalogUUID },
  });

  if (!catalog) {
    throw new Error('该表情包不存在');
  }

  const code = await ChatEmotionSecretSignal.getUniqHashId();
  const secretSignal = await ChatEmotionSecretSignal.create({
    code,
    catalogId: catalog.id,
    creatorId: playerId,
  });

  ctx.body = { uuid: secretSignal.uuid, code: secretSignal.code };
});

export default router;
