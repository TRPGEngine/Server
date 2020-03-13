import { PlayerUser } from '../models/user';
import _ from 'lodash';
import { ssoAuth } from '../middleware/auth';
import { TRPGRouter } from 'trpg/core';
const SSORouter = new TRPGRouter();

SSORouter.post('/sso/login', async (ctx) => {
  const username = _.get(ctx.request, 'body.username');
  const password = _.get(ctx.request, 'body.password');

  const player = await PlayerUser.findByUsernameAndPassword(username, password);
  if (_.isNil(player)) {
    throw new Error('用户不存在或密码错误');
  }

  const jwt = await PlayerUser.signJWT(player.uuid);

  ctx.body = {
    jwt,
  };
});

SSORouter.post('/sso/check', ssoAuth(), (ctx) => {
  ctx.body = {
    result: true,
  };
});

export default SSORouter;
