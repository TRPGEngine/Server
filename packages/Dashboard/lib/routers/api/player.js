const Router = require('koa-router');
const router = new Router();

router.get('/_list', async(ctx, next) => {
  let { page, limit } = ctx.request.query;
  page = Number(page) || 1;
  limit = Number(limit) || 10;

  let db = await ctx.trpgapp.storage.db;
  let count = await db.models.player_user.count();
  let data = await db.models.player_user.findAll({
    offset: (page-1)*limit,
    limit,
  });

  ctx.body = {
    "code": 0,
    "msg": "",
    "count": count,
    "data": data
  }
});

router.get('/_onlineCount', async(ctx, next) => {
  let count = ctx.trpgapp.player.list.list.length;

  ctx.body = count;
})

module.exports = router;
