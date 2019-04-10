const Router = require('koa-router');
const router = new Router();

router.get('/', function (ctx, next) {
  const template = require('../../views/chat.marko');
  ctx.render(template);
});

module.exports = router;
