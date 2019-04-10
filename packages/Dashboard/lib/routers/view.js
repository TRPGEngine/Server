const Router = require('koa-router');
const router = new Router();
const auth = require('../utils/middleware').auth;

router.get('/login', function (ctx, next) {
  const template = require('../views/login.marko');
  ctx.render(template);
});

const home = require('./view/home');
const player = require('./view/player');
const chat = require('./view/chat');
const group = require('./view/group');
const system = require('./view/system');
router.get('/', async (ctx) => {
  ctx.redirect('/admin/home');
});
router.use('/*', auth);
router.use('/home', home.routes(), home.allowedMethods());
router.use('/player', player.routes(), player.allowedMethods());
router.use('/chat', chat.routes(), chat.allowedMethods());
router.use('/group', group.routes(), group.allowedMethods());
router.use('/system', system.routes(), system.allowedMethods());

module.exports = router;
