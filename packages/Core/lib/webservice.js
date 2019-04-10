require('marko/node-require');
const http = require('http');
const Koa = require('koa');
const logger = require('koa-logger');
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');
const serve = require('koa-static');
const session = require('koa-session');
const Router = require('koa-router');
const fs = require('fs-extra');
const path = require('path');
const {WebSessionMiddleware} = require('./utils/iosession');
const debug = require('debug')('trpg:webservice');
const koaDebug = require('debug')('trpg:webservice:koa');
const appLogger = require('./logger')('application');

const publicDir = path.resolve(process.cwd(), './public');

module.exports = WebService;

class SessionStore {
  constructor(trpgapp) {
    this.trpgapp = trpgapp;
  }

  async get(sid) {
    return this.trpgapp.cache.get(`session:${sid}`);
  }

  async set(sid, session, maxAge) {
    return this.trpgapp.cache.set(`session:${sid}`, session);
  }

  destroy(sid) {
    return this.trpgapp.cache.remove(`session:${sid}`);
  }
}

function WebService(opts) {
  if (!(this instanceof WebService)) return new WebService(opts);
  this._app = new Koa();
  this._server = http.createServer(this._app.callback());
  this.webApi = {};
  this.homepage = '';
  this.port = 3000;
  this.context = this._app.context;
  this.trpgapp = this.context.trpgapp = opts.app;
  this.sessionOpt = {
    key: 'koa:trpg:sess',
    store: new SessionStore(this.trpgapp),
    maxAge: 86400000,// 24小时
    overwrite: true,
    httpOnly: true,
    signed: true,
    rolling: false,
    prefix: 'web:',
  }

  // check public dir
  if(!fs.existsSync(publicDir)) {
    debug('create public dir at:', publicDir);
    appLogger.info('create public dir at:', publicDir);
    fs.mkdirSync(publicDir);
  }

  initConfig.call(this, opts);
  initMiddleware.call(this);
  initContext.call(this);
  initRoute.call(this);
  initError.call(this);
}

function initConfig(opts) {
  if(opts && opts.port && typeof opts.port === 'number') {
    this.port = opts.port;
  }
  if(opts && opts.webApi && typeof opts.webApi === 'object') {
    this.webApi = opts.webApi;
  }
  if(opts && opts.homepage && typeof opts.homepage === 'string') {
    this.homepage = opts.homepage;
  }
}

function initMiddleware() {
  this._app.keys = ['trpg'];
  this.use(logger((str) => {
    koaDebug(str.trim());
  }));
  this.use(cors());
  this.use(bodyParser());
  this.use(serve(publicDir));
  this.use(session(this.sessionOpt, this._app))

  if(this.trpgapp.get('env') === 'development') {
    // 开发环境
    this.use((ctx, next) => {
      for (let moduleName in require.cache) {
        if(moduleName.indexOf('.marko') >= 0) {
          delete require.cache[moduleName];
        }
      }
      return next();
    })
  }

  // 错误处理机制
  this.use(async (ctx, next) => {
    try {
      await next();
      if(ctx.body === undefined) {
        ctx.status = 404;
        ctx.body = {
          result: false,
          msg: 'Not found',
        }
      }
    }catch(e) {
      console.error('[WebService]', e);
      if(ctx.status === 404) {
        // 404为状态默认值
        ctx.status = 500;
      }
      ctx.body = {
        result: false,
        msg: e.toString(),
      }

      if(typeof e === 'string') {
        e = `[webservice] ${ctx.request.originalUrl}: ${e}`;
      }
      this.trpgapp.errorWithContext(e, ctx); //汇报错误
    }
  });
  this.use(WebSessionMiddleware(this._app, this.sessionOpt))
}

function initContext() {
  this.context.render = function (template, data) {
    this.response.type = 'html';
    this.response.body = template.stream(data);
  }
}

function initRoute() {
  let router = new Router();
  // homepage
  if(!!this.homepage) {
    router.get('/', (ctx) => {
      ctx.redirect(this.homepage);
    });
    debug('set webserver homepage to:' + this.homepage);
    appLogger.info('set webserver homepage to:' + this.homepage);
  }else {
    router.get('/', (ctx) => {
      ctx.body = 'server is running!'
    });
  }

  // stat
  router.get('/stat', async (ctx) => {
    ctx.body = await fs.readJson(path.resolve(process.cwd(), './stat.json'));
  })

  // api
  for (var apiPath in this.webApi) {
    let path = apiPath;
    if(apiPath[0] !== '/') {
      path = '/' + apiPath;
    }

    router.get('/api'+path, this.webApi[apiPath]);
    debug('register web api [%s] success!', apiPath);
    appLogger.info('register web api [%s] success!', apiPath);
  }
  this.use(router.routes()).use(router.allowedMethods());
}

function initError() {
  this._app.on('error', function(err) {
    this.trpgapp.report.reportError(err);
  })
}

WebService.prototype.listen = function() {
  debug('start to listen(%d)', this.port);
  appLogger.info('start to listen(%d)', this.port);
  return this.getHttpServer().listen(this.port, () => {
    console.log('listening on *:'+this.port);
  });
}

WebService.prototype.getHttpServer = function() {
  return this._server;
}

WebService.prototype.use = function(...args) {
  this._app.use(...args);
  return this;
}
