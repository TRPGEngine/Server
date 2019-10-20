import Router from 'koa-router';
import { PlayerUser } from '../models/user';
import _ from 'lodash';
const SSORouter = new Router();

SSORouter.post('/sso/login', async (ctx) => {
  const username = _.get(ctx.request, 'body.username');
  const password = _.get(ctx.request, 'body.password');

  const player = await PlayerUser.findByUsernameAndPassword(username, password);
  const jwt = PlayerUser.signJWT(player.uuid);

  ctx.body = {
    jwt,
  };
});

export default SSORouter;
