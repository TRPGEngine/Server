import config from 'config';
import getPort from 'get-port';
import { sleep } from './utils';
import Debug from 'debug';
import _ from 'lodash';
import { TRPGApplication } from 'trpg/core';
import io from 'socket.io-client';
import supertest from 'supertest';
import { Response as OriResponse } from 'superagent';

interface Response<T> extends OriResponse {
  body: T;
}

require('iconv-lite').encodingExists('foo'); // https://stackoverflow.com/questions/46227783/encoding-not-recognized-in-jest-js
const loadModules = require('../../loader/standard');
const debug = Debug('trpg:test:app');

interface TRPGAppInstanceContext {
  app: TRPGApplication;
  port: number;
  socket: SocketIOClient.Socket;
  emitEvent: (eventName: string, data?: {}) => Promise<any>;
  request: {
    get: <T extends object = any>(url: string) => Promise<Response<T>>;
    post: <T extends object = any>(
      url: string,
      data: {},
      headers?: {}
    ) => Promise<Response<T>>;
  };
}

/**
 * 创建一个APP测试上下文
 * Usage: const context = buildAppContext();
 * context.xxx
 * NOTICE: 不要结构他。因为他初始值是么有数据的，是通过beforeAll的方式加载进来的
 */
export const buildAppContext = (): TRPGAppInstanceContext => {
  let context: TRPGAppInstanceContext = {
    app: null,
    port: config.get<number>('port'),
    socket: null,
    emitEvent: null,
    request: null,
  };
  beforeAll(async () => {
    debug('beforeAll');

    // 创建应用
    const port = await getPort({ port: Number(context.port) });
    const app: TRPGApplication = require('../../packages/Core/')({
      ...config,
      port, // 分配一个端口以保证不会重复
    });

    loadModules(app);

    app.run();
    debug('app start in %d', port);
    context.app = app;

    // 创建socket客户端连接
    const socket = io(`ws://127.0.0.1:${port}`, { autoConnect: false });
    socket.open();
    const emitEvent = (eventName: string, data?: {}) => {
      // 发送信息测试
      return new Promise((resolve) => {
        socket.emit(eventName, data, function(_res) {
          resolve(_res);
        });
      });
    };
    context.socket = socket;
    context.emitEvent = emitEvent;

    // 创建http服务测试框架
    const st = supertest(app.webservice.getHttpServer());
    context.request = {
      get(url) {
        return new Promise((resolve, reject) => {
          st.get(url).end((err, res) => {
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          });
        });
      },
      post(url, data, headers?) {
        return new Promise((resolve, reject) => {
          const ins = st.post(url).send(data);

          if (!_.isEmpty(headers)) {
            _.toPairs(headers).map(([key, val]) => {
              ins.set(key, String(val));
            });
          }

          ins.end((err, res) => {
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          });
        });
      },
    };

    // TODO: 要想办法弄掉
    await sleep(1000); // 强行sleep以保证app能正常加载完毕
  }, 20000);

  afterAll(async () => {
    debug('afterAll');

    await _.invoke(context, 'app.close');
    _.invoke(context, 'socket.close');

    debug('app close success');
  });

  return context;
};
