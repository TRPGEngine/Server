import Router from 'koa-router';
const router = new Router();
import _ from 'lodash';

interface AccountType {
  [username: string]: string;
}

router.post('/login', async (ctx, next) => {
  const username = _.get(ctx.request, 'body.username');
  const password = _.get(ctx.request, 'body.password');
  // if (!ctx.session.captcha || _captcha !== ctx.session.captcha) {
  //   ctx.body = {
  //     result: false,
  //     msg: '验证码出错',
  //   };
  //   return;
  // }

  const accounts: AccountType[] = ctx.trpgapp.get('dashboard.admin');
  const index = accounts.findIndex(
    (account) => account.username === username && account.password === password
  );

  if (index === -1) {
    ctx.body = {
      result: false,
      msg: '用户名或密码错误',
    };
    return;
  }

  ctx.body = {
    result: true,
  };
});

module.exports = router;
