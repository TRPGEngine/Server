const debug = require('debug')('trpg:socket');
const logger = require('./logger')();
const appLogger = require('./logger')('application');
const packageInfo = require('../../../package.json');

const applog = (...args) => {
  debug(...args);
  appLogger.info(...args);
};

// socket.io 服务
// TODO: 尚未实装
class SocketService {
  _app = null;
  _io = null;

  // 成员{name: string, fn: (data, cb) => any, hooks?: {before: any[], after: any[]}}
  events = [];

  constructor(app) {
    if (!app) {
      throw new Error('init socket service error: require app');
    }

    this._app = app;
    this._io = app.io;
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
      // 注册事件
      let wrap = { app, socket };
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

          event.fn.call(wrap, data, function(res) {
            cb(res);
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
    });
  }

  getAllEvents() {
    return this.events;
  }
}
