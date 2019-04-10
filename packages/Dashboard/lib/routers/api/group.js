const Router = require('koa-router');
const router = new Router();

router.get('/_list', async (ctx, next) => {
  let { page, limit } = ctx.request.query;
  page = Number(page) || 1;
  limit = Number(limit) || 10;

  const db = await ctx.trpgapp.storage.db;

  let count = await db.models.group_group.count();
  let data = await db.models.group_group.findAll({
    offset: (page - 1) * limit,
    limit,
  })

  ctx.body = {
    code: 0,
    msg: "",
    count: count,
    data: data
  }
});

module.exports = router;
