const debug = require('debug')('trpg:test');
const NodeEnvironment = require('jest-environment-node');
const io = require('socket.io-client');
const lodash = require('lodash');
const randomString = require('crypto-random-string');
const config = require('config');
let trpgapp = null;
const socket = io('ws://127.0.0.1:23256', {
  autoConnect: false,
});

function generateTRPGInstance() {
  const app = require('../../standard');
  return app;
}

class TRPGEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
  }

  async setup() {
    debug('Setup TRPG Test Environment');

    // 创建trpg实例
    trpgapp = generateTRPGInstance();
    const db = trpgapp.storage.db;

    socket.open();
    socket.on('error', (err) => {
      console.error('[TRPG-Test]', 'socket-client:', err);
    });

    // 声明沙盒内可用的全局变量
    this.global._ = lodash;
    this.global.trpgapp = trpgapp;
    this.global.db = db;
    this.global.socket = socket;
    this.global.testEvent = (eventFn, data) => {
      // 测试直接处理信息
      return new Promise(async function(resolve) {
        try {
          let cbres = { result: false }; // 默认返回信息
          let ret = await eventFn.call(
            {
              app: trpgapp,
              socket: null,
            },
            data,
            (_res) => {
              cbres = _res; // 只收集cb返回的最后的响应
            },
            db
          );

          if (ret !== undefined) {
            if (typeof ret === 'boolean') {
              resolve({ result: ret });
            } else if (
              typeof ret === 'object' &&
              typeof ret.result !== 'boolean'
            ) {
              resolve(Object.assign({ result: true }, ret));
            } else {
              resolve(ret);
            }
          } else {
            // 从cb中取结果
            resolve(cbres);
          }
        } catch (e) {
          resolve({ result: false, msg: e.toString() });
        }
      });
    };
    this.global.emitEvent = (eventName, data) => {
      // 发送信息测试
      return new Promise((resolve) => {
        socket.emit(eventName, data, function(_res) {
          resolve(_res);
        });
      });
    };
    this.global.generateRandomStr = (length = 10) => {
      return randomString(length);
    };

    await super.setup();
  }

  async teardown() {
    debug('Teardown TRPG Test Environment');

    socket.close();
    if (trpgapp) {
      // TODO: trpg还是没有关闭所有的连接, 可以考虑将其放到下一级(测试文件级)
      await trpgapp.close();
      trpgapp = null;
    }

    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = TRPGEnvironment;
