const Router = require('koa-router');
const router = new Router();

router.post('/error', async (ctx) => {
  let ip = ctx.request.headers['x-real-ip'] || ctx.request.ip;
  let ua = ctx.request.headers['user-agent'];
  let {message = '', stack = '', version} = ctx.request.body;

  const db = ctx.trpgapp.storage.db;
  console.log('report err from', ip,'stack', stack);
  await db.models.report_error.createAsync({
    ip,
    ua,
    message,
    stack: stack.trim(),
    version,
  });

  ctx.body = '提交成功';
});

module.exports = router;
