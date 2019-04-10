const debug = require('debug')('trpg:component:qqconnect');
const Router = require('koa-router');
const serve = require('koa-static');

module.exports = function QQConnectComponent(app) {
  initStorage.call(app);
  initWebService.call(app);
  initRouters.call(app);
  // TODO: 需要定期延长授权, 以提高用户体验

  return {
    name: 'QQConnectComponent',
    require: [
      'PlayerComponent',
    ],
  }
}

function initStorage() {
  let app = this;
  let storage = app.storage;
  storage.registerModel(require('./models/accessInfo.js'));

  app.on('initCompleted', function(app) {
    // 数据信息统计
    debug('storage has been load 1 qq oauth db model');
  });
}

function initWebService() {
  const app = this;
  const webservice = app.webservice;
  if(app.get('env') === 'development') {
    webservice.use(serve(__dirname + '/public'));
    // 用于清理view相关缓存的require缓存
    webservice.use(async (ctx, next) => {
      let reqModules = Object.keys(require.cache);
      let viewModules = reqModules.filter((item) => /.*\/QQConnect\/lib\/views\//.test(item));
      for (let modulePath of viewModules) {
        delete require.cache[modulePath];
      }
      await next();
    })
  }else {
    webservice.use(serve(__dirname + '/public', {maxage: 1000 * 60 * 60 * 24}));
  }

  // 增加一个读取配置的中间件
  webservice.use(async (ctx, next) => {
    ctx.QQConnectConfig = ctx.trpgapp.get('oauth.qqconnect');
    await next();
  })
}

function initRouters() {
  const app = this;
  const webservice = app.webservice;
  const router = new Router();

  const oauth = require('./routers/oauth');

  router.use('/oauth/qq', oauth.routes());
  webservice.use(router.routes());
}
