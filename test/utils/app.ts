import config from 'config';
import getPort from 'get-port';
import { sleep } from './utils';
import Debug from 'debug';
import _ from 'lodash';
import { TRPGApplication } from 'trpg/core';
require('iconv-lite').encodingExists('foo'); // https://stackoverflow.com/questions/46227783/encoding-not-recognized-in-jest-js
const loadModules = require('../../loader/standard');
const debug = Debug('trpg:test:app');

interface TRPGAppInstanceContext {
  app: TRPGApplication;
  port: number;
}

/**
 * 创建一个APP实例
 */
export const buildAppContext = (): TRPGAppInstanceContext => {
  let context = {
    app: null,
    port: config.get<number>('port'),
  };
  beforeAll(async () => {
    debug('beforeAll');

    const port = await getPort({ port: Number(context.port) });
    const app = require('../../packages/Core/')({
      ...config,
      port, // 分配一个端口以保证不会重复
    });

    loadModules(app);

    app.run();
    debug('app start in %d', port);
    context.app = app;

    // TODO: 要想办法弄掉
    await sleep(1000); // 强行sleep以保证app能正常加载完毕
  }, 10000);

  afterAll(async () => {
    debug('afterAll');

    await _.invoke(context, 'app.close');

    debug('app close success');
  });

  return context;
};
