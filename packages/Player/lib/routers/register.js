const debug = require('debug')('trpg:component:player:router:register');
const Router = require('koa-router');
const router = new Router();
const geetestWrapper = require('../utils/geetestWrapper');

router.get('/gt-register', async function (ctx, next) {
  const geetest = ctx.geetest;
  if(!geetest) {
    throw '极验未加载';
  }

  let data = await geetestWrapper(geetest, 'register', null);
  console.log('data', data);
  if(!data.success) {
    // 进入 fallback，如果一直进入此模式，请检查服务器到极验服务器是否可访问
    debug('[geetest] enter fallback');
    ctx.session.fallback = true;
    ctx.body = data;
  }else {
    ctx.session.fallback = false;
    ctx.body = data;
  }
});

router.post('/gt-validate', async function(ctx) {
  const geetest = ctx.geetest;
  if(!geetest) {
    throw '极验未加载';
  }

  let {
    geetest_challenge,
    geetest_validate,
    geetest_seccode,
  } = ctx.request.body;

  let isSuccess = await geetestWrapper(geetest, 'validate', ctx.session.fallback, {
    geetest_challenge,
    geetest_validate,
    geetest_seccode
  });
  ctx.body = isSuccess ? '极验成功' : '极验失败'
})

module.exports = router;
