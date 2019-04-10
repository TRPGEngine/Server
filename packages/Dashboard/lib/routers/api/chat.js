const Router = require('koa-router');
const router = new Router();
const isUUID = require('is-uuid');

router.post('/_save', async (ctx, next) => {
  // ctx.router available
  await ctx.trpgapp.chat.saveChatLogAsync();
  ctx.body = {
    result: true
  }
});

router.get('/_log', async(ctx, next) => {
  let { page, limit } = ctx.request.query;
  page = Number(page) || 1;
  limit = Number(limit) || 10;

  let count = await ctx.trpgapp.chat.getChatLogSumAsync();
  let data = await ctx.trpgapp.chat.getChatLogAsync(page, limit);

  ctx.body = {"code":0,"msg":"","count":count,"data":data}
});

router.post('/_sendSystemMsg', async (ctx, next) => {
  // ctx.router available
  let { to_uuid, type, title, content } = ctx.request.body;
  if(!isUUID.v1(to_uuid)) {
    ctx.body = {
      result: false,
      msg: '玩家uuid不合法'
    }
    return;
  }
  // TODO 检查uuid是否存在

  ctx.trpgapp.chat.sendSystemMsg(to_uuid, type, title, content, {});
  ctx.body = {
    result: true
  }
});

module.exports = router;
