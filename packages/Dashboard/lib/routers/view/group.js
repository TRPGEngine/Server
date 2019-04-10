const Router = require('koa-router');
const router = new Router();

router.get('/', function (ctx, next) {
  const template = require('../../views/group.marko');
  ctx.render(template);
});

module.exports = router;
