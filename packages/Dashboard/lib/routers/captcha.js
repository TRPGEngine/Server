const Router = require('koa-router');
const router = new Router();
const svgCaptcha = require('svg-captcha');

router.get('/captcha', function (ctx, next) {
  var captcha = svgCaptcha.create({
    size: 4,
    ignoreChars: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    noise: 2,
    width: 86,
    height: 38,
    fontSize: 38
  });
  ctx.session.captcha = captcha.text.toLowerCase();
  ctx.type = 'image/svg+xml';
  ctx.body = captcha.data;
});

module.exports = router;
