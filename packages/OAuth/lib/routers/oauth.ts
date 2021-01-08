import _ from 'lodash';
import { TRPGRouter } from 'trpg/core';

const oauthRouter = new TRPGRouter();

// 授权页面
oauthRouter.get('/authorize', (ctx) => {
  // TODO
});

export default oauthRouter;
