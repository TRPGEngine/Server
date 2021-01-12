import _ from 'lodash';
import { TRPGRouter } from 'trpg/core';
import { OAuthApp } from '../models/app';

const oauthRouter = new TRPGRouter();

// 授权页面
oauthRouter.get('/authorize', (ctx) => {
  // TODO
});

oauthRouter.get('/oauth/app/:appid/info', async (ctx) => {
  const appid = ctx.params;

  const appInfo = await OAuthApp.getAppInfo(appid);

  ctx.body = {
    appInfo,
  };
});

export default oauthRouter;
