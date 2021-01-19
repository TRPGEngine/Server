import _ from 'lodash';
import { TRPGRouter } from 'trpg/core';
import { OAuthApp } from '../models/app';
import { OAuthCode } from '../models/code';

const oauthRouter = new TRPGRouter();

oauthRouter.get('/app/:appid/info', async (ctx) => {
  const appid = ctx.params.appid;

  const appInfo = await OAuthApp.getAppInfo(appid);

  ctx.body = {
    appInfo,
  };
});

/**
 * 授权
 */
oauthRouter.post('/app/:appid/authorize', async (ctx) => {
  const appid = ctx.params.appid;
  const { scope } = ctx.body;

  const code = await OAuthCode.createCode(appid, scope);

  ctx.body = {
    code,
  };
});

export default oauthRouter;
