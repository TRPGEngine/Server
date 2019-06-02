import IO, { Server, Socket } from 'socket.io';
import Debug from 'debug';
const debug = Debug('trpg:socket');
import { getLogger } from './logger';
import { TRPGApplication } from '../types/app';
import { DBInstance } from './storage';
const logger = getLogger();
const appLogger = getLogger('application');
const packageInfo = require('../../../package.json');

export type MiddlewareFn = (socket: IO.Socket, fn: (err?: any) => void) => void;
export type SocketCallbackResult = {
  result: boolean;
  [other: string]: any;
};
export type SocketCallbackFn = (ret: SocketCallbackResult) => void;
export type SocketEventFn = (
  data: {},
  cb: SocketCallbackFn,
  db: DBInstance
) => any;
export interface EventType {
  name: string;
  fn: SocketEventFn;
}

const applog = (formatter: string, ...args: any[]) => {
  debug(formatter, ...args);
  appLogger.info(formatter, ...args);
};

const ioOpts = {
  pingInterval: 20000, // default: 25000
  pingTimeout: 40000, // default: 60000
};

// socket.io 服务
export default class SocketService {
  _app: TRPGApplication;
  _io: Server;
  events: EventType[];

  constructor(app: TRPGApplication) {
    if (!app) {
      throw new Error('init socket service error: require app');
    }

    this._app = app;
    this.events = []; // 成员{name: string, fn: (data, cb) => any, hooks?: {before: any[], after: any[]}}
    try {
      const port = Number(app.get('port'));
      if (app.webservice) {
        applog('start a http socket.io server');
        this._io = IO(app.webservice.getHttpServer(), ioOpts);
      } else {
        applog('start a independent socket.io server');
        this._io = IO(port, ioOpts);
      }
      applog('create io(%d) process success!', port);
    } catch (err) {
      applog('create io process error: %O', err);
      throw err;
    }
  }

  initIOEvent() {
    const app = this._app;

    this._io.on('connection', (socket) => {
      applog('a connect is created');

      socket.on('message', (data, cb) => {
        app.emit('message', data, cb);
      });

      socket.on('disconnect', (data, cb) => {
        applog(
          'socket%s disconnect: %o',
          app.get('verbose') ? `[${socket.id}]` : '',
          data
        );
        // socket.iosession.destroy(); // 离线时移除之前的iosession // TODO: 需要放在外面
        app.emit('disconnect', socket);
      });
      socket.on('hello', (data, cb) => {
        var res = { data, version: packageInfo.version };
        cb(res);
      });

      app.emit('connection', socket);
      this.injectCustomEvents(socket);
    });
  }

  registerIOEvent(eventName: string, eventFn: SocketEventFn) {
    const index = this.events.findIndex((e) => {
      return e.name === eventName;
    });
    if (index >= 0) {
      applog('register socket event [%s] duplicated', eventName);
      return;
    }

    applog('register socket event [%s]', eventName);
    this.events.push({
      name: eventName,
      fn: async function(data, cb) {
        if (!data) {
          data = {}; // 定义一个默认空对象防止在方法内部因为取不到参数而报错
        }

        const wrap = this; // 此处的this是指 injectCustomEvents 方法分配的this
        const app = wrap.app;
        const db = app.storage.db;
        try {
          let ret = await eventFn.call(this, data, cb, db);
          if (ret !== undefined) {
            // return 方法返回结果信息
            if (typeof ret === 'object') {
              if (!ret.result) {
                ret.result = true;
              }

              cb(ret);
            } else if (typeof ret === 'boolean') {
              cb({ result: ret });
            } else {
              cb({ result: true, data: ret });
            }
          }
        } catch (err) {
          // 若event.fn内没有进行异常处理，进行统一的异常处理
          if (cb && typeof cb === 'function') {
            cb({ result: false, msg: err.toString() || '系统忙' });
            if (typeof err === 'string') {
              // 如果不是一个带有堆栈信息的错误。则修改err为一个带其他信息的字符串
              err = `${err}\nEvent Name: ${eventName}\nReceive:\n${JSON.stringify(
                data,
                null,
                4
              )}`;
            }
            app.reportservice.reportError(err); // 使用汇报服务汇报错误
          } else {
            applog(
              'unhandled error msg return on %s, received %o',
              eventName,
              data
            );
          }
        }
      },
    });
  }

  // 向socket注入自定义事件处理
  injectCustomEvents(socket: Socket) {
    // 注册事件
    const app = this._app;
    const wrap = { app, socket };
    for (let event of this.events) {
      let eventName = event.name;
      socket.on(eventName, (data, cb) => {
        // 为原生socket事件进行一层封装
        const socketId = wrap.socket.id;
        const verbose = app.get('verbose');
        data = JSON.parse(JSON.stringify(data));
        if (verbose) {
          debug('[%s]%s <-- %o', socketId, eventName, data);
        } else {
          debug('%s <-- %o', eventName, data);
        }
        logger.info(eventName, '<--', data);

        const startTime = new Date().valueOf(); // 记录开始时间
        event.fn.call(wrap, data, (res: SocketCallbackResult) => {
          cb(res);
          const endTime = new Date().valueOf(); // 记录结束时间
          this.recordSocketTime(eventName, endTime - startTime);
          res = JSON.parse(JSON.stringify(res));
          if (verbose) {
            debug('[%s]%s --> %o', socketId, eventName, res);
          } else {
            debug('%s --> %o', eventName, res);
          }

          if (res.result === false) {
            logger.error(eventName, '-->', res);
          } else {
            logger.info(eventName, '-->', res);
          }
        });
      });
    }
  }

  // 应用中间件
  use(middleware: MiddlewareFn) {
    this._io.use(middleware);
  }

  /**
   * 记录socket事件的耗时到cache中， 定期清理统计
   * @param eventName 事件名
   * @param millisecond 用时: 单位毫秒
   */
  recordSocketTime(eventName: string, millisecond: number) {
    const cacheKey = `meter:socket:event:${eventName}`;

    this._app.cache.rpush(cacheKey, millisecond);
  }

  getAllEvents() {
    return this.events;
  }

  on(name: string, cb: Function) {
    this._io.on(name, cb);
  }

  close(cb: () => void) {
    this._io.close(cb);
  }
}
