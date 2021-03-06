import _ from 'lodash';
import { ssoAuth } from 'packages/Player/lib/middleware/auth';
import { PlayerJWTPayload } from 'packages/Player/types/player';
import { TRPGRouter } from 'trpg/core';
import { OAuthApp } from '../models/app';
import { OAuthCode } from '../models/code';

const oauthRouter = new TRPGRouter<{
  player?: PlayerJWTPayload;
}>();

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
oauthRouter.post('/app/:appid/authorize', ssoAuth(), async (ctx) => {
  const appid = ctx.params.appid;
  const { scope } = ctx.request.body;
  const player = ctx.state.player;

  const code = await OAuthCode.createCode(appid, scope, player.uuid);

  ctx.body = {
    code,
  };
});

/**
 * 获取用户的公共信息
 */
oauthRouter.post('/app/:appid/info/scope/public', async (ctx) => {
  const appid = ctx.params.appid;
  const { appsecret, code } = ctx.request.body;

  const user = await OAuthCode.getUserPublicScope(appid, appsecret, code);

  ctx.body = {
    user,
  };
});

export default oauthRouter;
