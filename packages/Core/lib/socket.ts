import IO, { Server, Socket } from 'socket.io';
import Debug from 'debug';
const debug = Debug('trpg:socket');
import { getLogger } from './logger';
import { TRPGApplication } from '../types/app';
import { DBInstance } from './storage';
const logger = getLogger();
const appLogger = getLogger('application');
import _ from 'lodash';
import { rateLimitSocketCheck } from './utils/rate-limit';
import { getSocketIp } from './utils/socket-helper';

export type NamespaceMiddlewareFn = (
  socket: IO.Socket,
  next: (err?: any) => void
) => void;

export type SocketMiddlewareFn = (
  packet: IO.Packet,
  next: (err?: any) => void
) => void;

export interface SocketEventType {
  name: string;
  fn: SocketEventFn;
}
type BaseDataType = {
  [name: string]: any;
};
export type SocketCallbackResult = {
  result: boolean;
  [other: string]: any;
};
export type SocketCallbackFn = (ret: SocketCallbackResult) => Promise<void>;

/**
 * 用于将socket数据进行脱敏处理
 */
interface SocketDataMaskMapType {
  [eventName: string]: string[];
}

/**
 * 进行一层数据处理的封装后的Socket事件方法
 */
export type SocketEventFn = (
  data: BaseDataType,
  cb: SocketCallbackFn,
  db: DBInstance
) => void;

type EventRet = {} | boolean | void;
interface EventWrap {
  app: TRPGApplication;
  socket: SocketIO.Socket;
}
/**
 * Socket事件的方法类型
 * 原始事件方法类型
 */
export type EventFunc<DataType extends BaseDataType = BaseDataType> = (
  this: EventWrap,
  data: DataType,
  cb: SocketCallbackFn,
  db: DBInstance
) => Promise<EventRet> | EventRet;

const applog = (formatter: string, ...args: any[]) => {
  debug(formatter, ...args);
  appLogger.info(formatter, ...args);
};

const ioOpts: IO.ServerOptions = {
  pingInterval: 20000, // default: 25000
  pingTimeout: 40000, // default: 60000
  transports: ['websocket'],
};

// socket.io 服务
export default class SocketService {
  _app: TRPGApplication;
  _io: Server;
  events: SocketEventType[];
  socketDataMaskMap: SocketDataMaskMapType = {};

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

  get sockets() {
    return this._io.sockets;
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

      app.emit('connection', socket);
      this.injectCustomEvents(socket);
    });
  }

  registerIOEvent(eventName: string, eventFn: EventFunc) {
    const whitelist: string[] = this._app.get('rateLimit.whitelist.ws', []);
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
      fn: async function (data, cb) {
        if (!data) {
          data = {}; // 定义一个默认空对象防止在方法内部因为取不到参数而报错
        }

        const wrap = this; // 此处的this是指 injectCustomEvents 方法分配的this
        const app: TRPGApplication = wrap.app;
        const socket: Socket = wrap.socket;
        const ip: string = wrap.ip;

        const db = app.storage.db;
        try {
          if (!whitelist.includes(eventName)) {
            // 不在白名单中的请求进行限流检测
            await rateLimitSocketCheck(app, ip);
          }

          const ret = await eventFn.call(this, data, cb, db);
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
          if (_.isFunction(cb)) {
            let errorMsg: string;
            if (err instanceof Error) {
              errorMsg = err.message;
            } else {
              errorMsg = err.toString();
            }

            const errorPayload: any = {
              result: false,
              msg: errorMsg || '系统忙',
            };
            if (!_.isNil(err.code)) {
              errorPayload.code = err.code;
            }
            cb(errorPayload);

            if (typeof err === 'string') {
              // 如果不是一个带有堆栈信息的错误。则修改err为一个带其他信息的字符串
              err = `${err}\nEvent Name: ${eventName}\nReceive:\n${JSON.stringify(
                data,
                null,
                4
              )}`;
            }

            // 使用汇报服务汇报错误
            app.reportservice.reportErrorWithContext(err, {
              socketId: socket.id,
              eventName,
              received: data,
              errorMsg,
            });
          } else {
            applog(
              'unhandled error msg return on %s, received %o',
              eventName,
              data
            );
            app.reportservice.reportError(err); // 使用汇报服务汇报错误
          }
        }
      },
    });
  }

  // 向socket注入自定义事件处理
  injectCustomEvents(socket: Socket) {
    // 注册事件
    const app = this._app;
    const ip = getSocketIp(socket);
    const wrap = { app, socket, ip };

    for (let event of this.events) {
      let eventName = event.name;
      socket.on(eventName, (data, cb) => {
        // 为原生socket事件进行一层封装
        if (_.isNil(data)) {
          // 如果data为null的话JSON.parse(JSON.stringify(data))无法正常处理
          data = {};
        }
        const socketId = wrap.socket.id;
        const verbose = app.get('verbose');
        const debugData = this.processSocketDataMask(
          eventName,
          JSON.parse(JSON.stringify(data))
        );
        if (verbose) {
          debug('[%s]%s <-- %o', socketId, eventName, debugData);
        } else {
          debug('%s <-- %o', eventName, debugData);
        }

        logger.info(
          {
            tags: ['ws', 'rev'],
          },
          eventName,
          socketId,
          JSON.stringify(debugData)
        );

        const startTime = new Date().valueOf(); // 记录开始时间
        event.fn.call(wrap, data, (res: SocketCallbackResult) => {
          cb(res);
          const endTime = new Date().valueOf(); // 记录结束时间
          const usageTime = endTime - startTime; // 用时，单位为毫秒
          this.recordSocketTime(eventName, usageTime);
          res = this.processSocketDataMask(
            eventName,
            JSON.parse(JSON.stringify(res))
          ) as any;
          if (verbose) {
            debug('[%s]%s --> %o', socketId, eventName, res);
          } else {
            debug('%s --> %o', eventName, res);
          }

          // 记录日志
          if (res.result === false) {
            logger.error(
              {
                tags: ['ws', 'send'],
              },
              eventName,
              socketId,
              JSON.stringify(res),
              usageTime + 'ms'
            );
          } else {
            logger.info(
              {
                tags: ['ws', 'send'],
              },
              eventName,
              socketId,
              JSON.stringify(res),
              usageTime + 'ms'
            );
          }
        });
      });
    }
  }

  /**
   * 注册Socket脱敏数据
   */
  registerSocketDataMask(eventName: string, fieldPath: string) {
    const socketDataMaskMap = this.socketDataMaskMap;
    if (Array.isArray(socketDataMaskMap[eventName])) {
      socketDataMaskMap[eventName].push(fieldPath);
    } else {
      socketDataMaskMap[eventName] = [fieldPath];
    }
  }

  /**
   * 处理Socket脱敏数据
   */
  processSocketDataMask(eventName: string, eventData: object): object {
    eventData = _.clone(eventData);
    const socketDataMaskMap = this.socketDataMaskMap;
    if (Array.isArray(socketDataMaskMap[eventName])) {
      socketDataMaskMap[eventName].forEach((fieldPath) => {
        if (_.has(eventData, fieldPath)) {
          _.unset(eventData, fieldPath);
        }
      });
    }

    return eventData;
  }

  // 应用中间件
  use(middleware: NamespaceMiddlewareFn) {
    this._io.use(middleware);
  }

  /**
   * 记录socket事件的耗时到cache中， 定期清理统计
   * @param eventName 事件名
   * @param millisecond 用时: 单位毫秒
   */
  recordSocketTime(eventName: string, millisecond: number) {
    const cacheKey = `metrics:socket:event:${eventName}`;

    this._app.cache.rpush(cacheKey, millisecond);
  }

  getAllEvents() {
    return this.events;
  }

  on(name: string, cb: Function) {
    this._io.on(name, cb);
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._io.close(() => {
        resolve();
      });
    });
  }
}
