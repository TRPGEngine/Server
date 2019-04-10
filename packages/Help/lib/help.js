const serve = require('koa-static');
const Router = require('koa-router');
const debug = require('debug')('trpg:component:help');

module.exports = function HelpComponent(app) {
  initStorage.call(app);
  initWebService.call(app);
  initRouters.call(app);

  return {
    name: 'HelpComponent',
  };
};

function initStorage() {
  let app = this;
  let storage = app.storage;
  storage.registerModel(require('./models/feedback.js'));

  app.on('initCompleted', function(app) {
    // 数据信息统计
    debug('storage has been load 1 help db model');
  });
}

function initWebService() {
  const app = this;
  const webservice = app.webservice;
  if (app.get('env') === 'development') {
    webservice.use(serve(__dirname + '/public'));
    // 用于清理view相关缓存的require缓存
    webservice.use(async (ctx, next) => {
      let reqModules = Object.keys(require.cache);
      let viewModules = reqModules.filter((item) =>
        /.*\/Help\/lib\/views\//.test(item)
      );
      for (let modulePath of viewModules) {
        delete require.cache[modulePath];
      }
      await next();
    });
  } else {
    webservice.use(
      serve(__dirname + '/public', { maxage: 1000 * 60 * 60 * 24 })
    );
  }
}

function initRouters() {
  const app = this;
  const webservice = app.webservice;
  const router = new Router();

  const faq = require('./routers/faq');

  router.use('/help', faq.routes());
  webservice.use(router.routes());
}
