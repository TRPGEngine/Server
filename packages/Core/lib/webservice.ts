require('marko/node-require');
import http from 'http';
import Koa, { Middleware } from 'koa';
import logger from 'koa-logger';
import helmet from 'koa-helmet';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import serve from 'koa-static';
import session from 'koa-session';
import Router from 'koa-router';
import fs from 'fs-extra';
import path from 'path';
import { WebSessionMiddleware } from './utils/iosession';
import Debug from 'debug';
const debug = Debug('trpg:webservice');
const koaDebug = Debug('trpg:webservice:koa');
import { getLogger } from './logger';
const appLogger = getLogger('application');

import { TRPGApplication } from '../types/app';
import { CacheValue } from './cache';

const publicDir = path.resolve(process.cwd(), './public');

class SessionStore {
  trpgapp: TRPGApplication;

  constructor(trpgapp: TRPGApplication) {
    this.trpgapp = trpgapp;
  }

  async get(sid: string) {
    return this.trpgapp.cache.get(`session:${sid}`);
  }

  async set(sid: string, session: CacheValue, maxAge: number) {
    return this.trpgapp.cache.set(`session:${sid}`, session);
  }

  destroy(sid: string) {
    return this.trpgapp.cache.remove(`session:${sid}`);
  }
}

export default class WebService {
  private _app = new Koa();
  private _server = http.createServer(this._app.callback());
  webApi = {};
  homepage = '';
  port = 23256;
  context = this._app.context;
  trpgapp: TRPGApplication;
  sessionOpt: any;

  constructor(opts) {
    this.trpgapp = this.context.trpgapp = opts.app;
    this.sessionOpt = {
      key: 'koa:trpg:sess',
      store: new SessionStore(this.trpgapp),
      maxAge: 86400000, // 24小时
      overwrite: true,
      httpOnly: true,
      signed: true,
      rolling: false,
      prefix: 'web:',
    };

    // check public dir
    if (!fs.existsSync(publicDir)) {
      debug('create public dir at:', publicDir);
      appLogger.info('create public dir at:', publicDir);
      fs.mkdirSync(publicDir);
    }

    this.initConfig(opts);
    this.initMiddleware();
    this.initContext();
    this.initRoute();
    this.initError();
  }

  get app() {
    return this._app;
  }

  /**
   * 初始化配置信息
   * @param opts 配置
   */
  initConfig(opts) {
    if (opts && opts.port && typeof opts.port === 'number') {
      this.port = opts.port;
    }
    if (opts && opts.webApi && typeof opts.webApi === 'object') {
      this.webApi = opts.webApi;
    }
    if (opts && opts.homepage && typeof opts.homepage === 'string') {
      this.homepage = opts.homepage;
    }
  }

  /**
   * 初始化中间件
   */
  initMiddleware() {
    this._app.keys = ['trpg'];
    this.use(
      logger((str: string) => {
        koaDebug(str.trim());
      })
    );
    this.use(helmet());
    this.use(cors());
    this.use(bodyParser());
    this.use(serve(publicDir));
    this.use(session(this.sessionOpt, this._app));

    if (this.trpgapp.get('env') === 'development') {
      // 开发环境
      this.use((ctx, next) => {
        for (let moduleName in require.cache) {
          if (moduleName.indexOf('.marko') >= 0) {
            delete require.cache[moduleName];
          }
        }
        return next();
      });
    }

    // 错误处理机制
    this.use(async (ctx, next) => {
      try {
        await next();
        if (ctx.body === undefined) {
          ctx.status = 404;
          ctx.body = {
            result: false,
            msg: 'Not found',
          };
        }
      } catch (e) {
        console.error('[WebService]', e);
        if (ctx.status === 404) {
          // 404为状态默认值
          ctx.status = 500;
        }
        ctx.body = {
          result: false,
          msg: e.toString(),
        };

        if (typeof e === 'string') {
          e = `[webservice] ${ctx.request.originalUrl}: ${e}`;
        }
        this.trpgapp.errorWithContext(e, ctx); //汇报错误
      }
    });
    this.use(WebSessionMiddleware(this._app, this.sessionOpt));
  }

  /**
   * 初始化上下文信息
   */
  initContext() {
    this.context.render = function(template, data) {
      this.response.type = 'html';
      this.response.body = template.stream(data);
    };
  }

  /**
   * 初始化路由
   */
  initRoute() {
    const router = new Router();
    // homepage
    if (!!this.homepage) {
      router.get('/', (ctx) => {
        ctx.redirect(this.homepage);
      });
      debug('set webserver homepage to:' + this.homepage);
      appLogger.info('set webserver homepage to:' + this.homepage);
    } else {
      router.get('/', (ctx) => {
        ctx.body = 'server is running!';
      });
    }

    // stat
    router.get('/stat', async (ctx) => {
      ctx.body = await fs.readJson(path.resolve(process.cwd(), './stat.json'));
    });

    // api
    for (var apiPath in this.webApi) {
      let path = apiPath;
      if (apiPath[0] !== '/') {
        path = '/' + apiPath;
      }

      router.get('/api' + path, this.webApi[apiPath]);
      debug('register web api [%s] success!', apiPath);
      appLogger.info('register web api [%s] success!', apiPath);
    }
    this.use(router.routes()).use(router.allowedMethods());
  }

  /**
   * 初始化路由处理
   */
  initError() {
    this._app.on('error', function(err) {
      this.trpgapp.report.reportError(err);
    });
  }

  /**
   * 插入中间件
   * @param middleware 中间件
   */
  use(middleware: Middleware) {
    this._app.use(middleware);
    return this;
  }

  listen() {
    debug('start to listen(%d)', this.port);
    appLogger.info('start to listen(%d)', this.port);
    return this.getHttpServer().listen(this.port, () => {
      console.log('listening on *:' + this.port);
    });
  }

  getHttpServer() {
    return this._server;
  }
}
