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
import jwt from 'jsonwebtoken';
import { WebSessionMiddleware } from './utils/iosession';
import Debug from 'debug';
const debug = Debug('trpg:webservice');
const koaDebug = Debug('trpg:webservice:koa');
import { getLogger } from './logger';
const appLogger = getLogger('application');
import _ from 'lodash';

import { TRPGApplication } from '../types/app';
import { CacheValue } from './cache';
import Application from './application';

const publicDir = path.resolve(process.cwd(), './public');
const jwtIssuer = 'trpg';

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

interface WebServiceOpts {
  app: Application;
  port: number;
  webApi: any;
  homepage: string;
}

interface JWTConfig {
  secret: string;
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
  jwtConfig: JWTConfig;

  constructor(opts: WebServiceOpts) {
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
    this.initForward();
    this.initError();
  }

  get app(): Koa {
    return this._app;
  }

  /**
   * 初始化配置信息
   * @param opts 配置
   */
  initConfig(opts: WebServiceOpts) {
    if (opts && opts.port && typeof opts.port === 'number') {
      this.port = opts.port;
    }
    if (opts && opts.webApi && typeof opts.webApi === 'object') {
      this.webApi = opts.webApi;
    }
    if (opts && opts.homepage && typeof opts.homepage === 'string') {
      this.homepage = opts.homepage;
    }

    this.jwtConfig = opts.app.get<JWTConfig>('jwt', {});
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
    this.use(serve(publicDir, { maxage: 14 * 24 * 60 * 60 * 1000 })); // 缓存14天
    this.use(session(this.sessionOpt, this._app));
    this.use(async (ctx, next) => {
      const url = ctx.url;
      if (_.isString(url) && url.startsWith('/api')) {
        const startDate = new Date().valueOf();
        await next();
        const usageDate = new Date().valueOf() - startDate;

        // 记录用时
        setTimeout(() => {
          this.recordWebserviceTime(url, usageDate);
        }, 0);
      } else {
        return next();
      }
    });

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

    // 返回结果处理
    this.use(async (ctx, next) => {
      const ret = await next();

      if (!_.isUndefined(ret) && _.isUndefined(ctx.body)) {
        if (typeof ret === 'boolean') {
          ctx.body = {
            result: ret,
          };
        } else if (typeof ret === 'string' || typeof ret === 'number') {
          ctx.body = {
            msg: ret,
          };
        } else if (typeof ret === 'object') {
          ctx.body = ret;
        }
      }
    });

    // 错误处理机制
    this.use(async (ctx, next) => {
      try {
        await next();

        if (typeof ctx.body === 'object' && !_.isBoolean(ctx.body.result)) {
          // 如果没有状态则补全状态
          ctx.body.result = true;
        }

        if (ctx.body === undefined) {
          let msg = '';
          if (ctx.status === 404) {
            msg = 'Not found';
          } else if (ctx.status === 500) {
            msg = 'System Error';
          } else if (ctx.status === 403) {
            msg = 'Forbidden';
          } else {
            msg = 'Unknown Error';
          }

          ctx.body = {
            result: false,
            msg,
          };
        }
      } catch (e) {
        if (ctx.status === 404) {
          // 404为状态默认值
          ctx.status = 500;
        }
        ctx.body = {
          result: false,
          msg: e instanceof Error ? e.message : e.toString(),
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
    // 渲染方法
    this.context.render = function(template, data) {
      this.response.type = 'html';
      this.response.body = template.stream(data);
    };

    // jwt 相关
    this.context.jwtSign = this.jwtSign;
    this.context.jwtVerify = this.jwtVerify;
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
    router.get('/api/stat', async (ctx) => {
      ctx.body = await fs.readJson(path.resolve(process.cwd(), './stat.json'));
    });

    // api
    for (let apiPath in this.webApi) {
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
   * 初始化事件转发
   */
  initForward() {
    // 转发外部传来的connection 事件
    this.trpgapp.on('connection', (connection) => {
      this.app.emit('connection', connection);
    });
  }

  /**
   * 初始化路由处理
   */
  initError() {
    this._app.on('error', (err) => {
      this.trpgapp.error(err);
    });
  }

  /**
   * 插入中间件
   * @param middleware 中间件
   */
  use(middleware: Middleware<any, any>) {
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

  /**
   * 记录 webservice route 服务的用时
   * @param path 访问请求的请求地址
   * @param millisecond 请求用时
   */
  recordWebserviceTime(path: string, millisecond: number) {
    const cacheKey = `metrics:webservice:route:${path}`;

    this.trpgapp.cache.rpush(cacheKey, millisecond);
  }

  /**
   * 签名jwt
   * 过期时间一天
   * @param payload 签名内容包
   */
  jwtSign = (payload: any): string => {
    return jwt.sign(payload, this.jwtConfig.secret, {
      expiresIn: '1d',
      issuer: jwtIssuer,
    });
  };

  /**
   * 校验jwt
   * 返回校验后的结果
   */
  jwtVerify = (token: string): Promise<string | object> => {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        this.jwtConfig.secret,
        {
          issuer: jwtIssuer,
        },
        (err, decoded) => {
          if (err) {
            reject(err);
          } else {
            resolve(decoded);
          }
        }
      );
    });
  };
}
