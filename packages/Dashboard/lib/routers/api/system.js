const Router = require('koa-router');
const router = new Router();
const os = require('os');

router.post('/_login', async(ctx, next) => {
  const { username, password, _captcha } = ctx.request.body;
  const config = ctx.trpgapp.get('dashboard');
  if(!ctx.session.captcha || _captcha !== ctx.session.captcha) {
    ctx.body = {
      result: false,
      msg: '验证码出错'
    }
    return;
  }

  let accounts = config.admin;
  let index = accounts.find(account => account.username === username && account.password === password);

  if(index === -1) {
    ctx.body = {
      result: false,
      msg: '用户名或密码错误'
    }
    return;
  }

  ctx.session.tempAuth = true;
  ctx.body = {
    result: true
  }
})

router.get('/_info', async(ctx, next) => {
  ctx.body = {
    result: true,
    info: {
      arch: os.arch(),
      cpus: os.cpus(),
      freemem: os.freemem(),
      hostname: os.hostname(),
      platform: os.platform(),
      totalmem: os.totalmem(),
      type: os.type(),
      uptime: os.uptime(),
      loadavg: os.loadavg(),
    }
  }
})

module.exports = router;
