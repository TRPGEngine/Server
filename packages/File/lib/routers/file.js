const Router = require('koa-router');
const send = require('koa-send');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth')();
const fileStorage = require('../middleware/storage/file');
const fileProcess = require('../middleware/process');

let router = new Router();

let ret = async (ctx) => {
  ctx.body = ctx.fileinfo;
}

router.post('/upload/persistence', auth, upload(true).single('file'), fileProcess('./public/uploads/persistence', false), fileStorage(true), ret);
router.post('/upload/temporary', auth, upload(false).single('file'), fileProcess('./public/uploads/temporary', false), fileStorage(false), ret);

router.get('/download/:fileuuid/:filename?', async (ctx) => {
  const fileuuid = ctx.params.fileuuid;
  const trpgapp = ctx.trpgapp;
  const db = trpgapp.storage.db;

  let info = await db.models.file_file.oneAsync({uuid: fileuuid});
  if(!info) {
    ctx.body = '没有该文件记录';
    return;
  }

  let name = info.name;
  let is_persistence = info.is_persistence;

  ctx.type = 'application/octet-stream';
  try {
    if(is_persistence) {
      await send(ctx, `./public/uploads/persistence/${name}`);
    }else {
      await send(ctx, `./public/uploads/temporary/${name}`);
    }
  }catch(e) {
    console.error(e);
    ctx.body = '没有找到文件, Not Found';
  }
})

module.exports = router;
