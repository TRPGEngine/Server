const Router = require('koa-router');
const url = require('url');
const querystring = require('querystring');
const uuid = require('uuid/v1');

const GET_AUTH_CODE_URL = "https://graph.qq.com/oauth2.0/authorize";
const GET_ACCESS_TOKEN_URL = "https://graph.qq.com/oauth2.0/token";
const GET_OPENID_URL = "https://graph.qq.com/oauth2.0/me";
const GET_USER_INFO_URL = "https://graph.qq.com/user/get_user_info";

const router = new Router();

router.get('/login', (ctx, next) => {
  // let state = Math.random();// 生成一个随机数作为state
  // ctx.session.qqconnectState = state;
  const config = ctx.QQConnectConfig;
  let state = ctx.query.platform || 'web';

  let params = {
    response_type: 'code',
    client_id: config.appid,
    redirect_uri: encodeURI(config.callback),
    state,
    scope: config.scope.join(',')
  }

  ctx.redirect(url.format({
    host: GET_AUTH_CODE_URL,
    query: params
  }));
})

router.get('/callback', async (ctx, next) => {
  const config = ctx.QQConnectConfig;
  const template = require('../views/callback.marko');
  let {code, state, usercancel} = ctx.query;
  let platform = state;

  if(usercancel) {
    // wap端用户取消登录
    ctx.body = '用户取消登录';
    return;
  }

  if(!code || !state) {
    ctx.body = '缺少信息, 请重试';
    return;
  }

  // TODO
  // if(state !== ctx.session.qqconnectState) {
  //   ctx.body = '会话失效, 请重试';
  //   return;
  // }

  // 获取access_token
  let accessData = await ctx.trpgapp.request.get(GET_ACCESS_TOKEN_URL, {
    grant_type: 'authorization_code',
    client_id: config.appid,
    client_secret: config.appkey,
    code,
    redirect_uri: encodeURI(config.callback),
  });
  let {access_token, expires_in, refresh_token} = querystring.parse(accessData);

  console.log('accessData', accessData);

  // 获取openid
  let meData = await ctx.trpgapp.request.get(GET_OPENID_URL, {access_token});
  console.log('meData', meData);
  meData = JSON.parse(meData.replace(/callback|\(|\)|;/g, ''));
  let openid = meData.openid;

  let res = {};
  let db = await ctx.trpgapp.storage.db;

  await db.transactionAsync(async () => {
    let record = await db.models.oauth_qq_access_info.oneAsync({openid});
    if(record) {
      // 用户已通过qq登录注册账号
      // let player = await record.getRelatedUserAsync();
      let playerId = await record.related_user_id;
      let player = await db.models.player_user.findByPk(playerId);
      let token = uuid();
      if(platform === 'app') {
        player.app_token = token;
      }else {
        player.token = token;
      }
      console.log('TODO: TMP', JSON.parse(JSON.stringify(player)));
      await player.saveAsync();
      res = {
        uuid: player.uuid,
        token
      }
    } else {
      // 用户未通过qq登录注册账号
      // 获取用户信息
      let userData = await ctx.trpgapp.request.get(GET_USER_INFO_URL, {
        access_token,
        oauth_consumer_key: config.appid,
        openid,
      });
      console.log('userData', userData);
      let {
        gender,
        nickname,
        figureurl,
        figureurl_1,
        figureurl_2,
        figureurl_qq_1,
        figureurl_qq_2,
      } = userData;
      let avatar = figureurl_qq_2 || figureurl_qq_1;
      avatar = avatar.toString().replace('http:', 'https:');

      // 创建账户
      let newRecord = await db.models.oauth_qq_access_info.create({
        access_token,
        expires_in,
        refresh_token,
        openid,
      });
      let internalId = 10000 + newRecord.id;
      let data = {
        nickname,
        avatar,
        sex: gender,
      };

      let token = uuid();
      if(platform === 'app') {
        data.app_token = token;
      }else {
        data.token = token;
      }
      let newPlayer = await ctx.trpgapp.player.createNewAsync('qq' + internalId, openid, data);

      // await newRecord.setRelatedUserAsync(newPlayer);
      newRecord.relatedUserId = newPlayer.id;
      await newRecord.save();
      res = {
        uuid: newPlayer.uuid,
        token
      }
    }
  });

  console.log('res data', res, ctx.query);
  ctx.render(template, res);
})

module.exports = router;
