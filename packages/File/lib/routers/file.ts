import Router from 'koa-router';
import send from 'koa-send';
import upload from '../middleware/upload';
import sha256 from '../middleware/sha256';
const auth = require('../middleware/auth');
const fileStorage = require('../middleware/storage/file');

const router = new Router();

const ret = async (ctx) => {
  ctx.body = ctx.fileinfo;
};

router.post(
  '/upload/persistence',
  auth(),
  upload(true).single('file') as any,
  sha256(),
  fileStorage(true),
  ret
);
router.post(
  '/upload/temporary',
  auth(),
  upload(false).single('file') as any,
  sha256(),
  fileStorage(false),
  ret
);

router.get('/download/:fileuuid/:filename?', async (ctx) => {
  const fileuuid = ctx.params.fileuuid;
  const trpgapp = ctx.trpgapp;
  const db = trpgapp.storage.db;

  let info = await db.models.file_file.findOne({ where: { uuid: fileuuid } });
  if (!info) {
    ctx.body = '没有该文件记录';
    return;
  }

  let name = info.name;
  let is_persistence = info.is_persistence;

  ctx.type = 'application/octet-stream';
  try {
    if (is_persistence) {
      await send(ctx as any, `./public/uploads/persistence/${name}`);
    } else {
      await send(ctx as any, `./public/uploads/temporary/${name}`);
    }
  } catch (e) {
    console.error(e);
    ctx.body = '没有找到文件, Not Found';
  }
});

module.exports = router;
