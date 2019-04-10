const debug = require('debug')('trpg:component:admin');
const serve = require('koa-static');
const Router = require('koa-router');
const os = require('os');
const https = require('https');

module.exports = function AdminComponent(app) {
  checkAdminPassword.call(app);
  initWebService.call(app);
  initRouters.call(app);
  initTimer.call(app);

  return {
    name: 'ActorComponent',
    require: ['PlayerComponent', 'GroupComponent', 'ChatComponent'],
  }
}

function checkAdminPassword() {
  const app = this;
  const config = app.get('dashboard');
  if(config.admin && Array.isArray(config.admin) && config.admin.length > 0) {
    debug('Dashboard账号:', config.admin.map(item => `${item.username}/${item.password}`).join(','));
  }else {
    throw '初始化失败。Dashboard账号未定义，需要相关配置';
  }
}

function initWebService() {
  const app = this;
  const webservice = app.webservice;
  if(app.get('env') === 'development') {
    webservice.use(serve(__dirname + '/public'));
    // 用于清理view相关缓存的require缓存
    webservice.use(async (ctx, next) => {
      let reqModules = Object.keys(require.cache);
      let viewModules = reqModules.filter((item) => /.*\/Dashboard\/lib\/views\//.test(item));
      for (let modulePath of viewModules) {
        delete require.cache[modulePath];
      }
      await next();
    })
  }else {
    webservice.use(serve(__dirname + '/public', {maxage: 1000 * 60 * 60 * 24}));
  }
}

function initRouters() {
  const app = this;
  const webservice = app.webservice;
  const router = new Router();

  const api = require('./routers/api');
  const view = require('./routers/view');
  const captcha = require('./routers/captcha');
  // webservice.use(api.routes());
  // webservice.use(view.routes());
  // webservice.use(captcha.routes());

  router.use('/admin', captcha.routes(), api.routes(), view.routes());
  webservice.use(router.routes());
}

function initTimer() {
  let app = this;

  app.registerStatJob('serverRunTime', async () => {
    return os.uptime();
  });

  app.registerStatJob('downloadTimes', () => {
    return new Promise((resolve, reject) => {
      var req = https.request({
        hostname: 'api.github.com',
        port: 443,
        path: '/repos/TRPGEngine/Client/releases',
        method: 'GET',
        headers: {
          'User-Agent': 'TRPG Engine'
        }
      }, function(res) {
        var data = "";
        res.on('data', (d) => {
          data += d;
        });
        res.on('end', () => {
          try {
            let json = JSON.parse(data);
            let count = 0;
            for (let release of json) {
              for(let asset of release.assets) {
                count += asset.download_count;
              }
            }
            resolve(count);
          }catch(e) {
            resolve(0);
          }
        })
      });
      req.on('error', function (e) {
        reject(e);
      });
      req.end();
    })
  });
}
