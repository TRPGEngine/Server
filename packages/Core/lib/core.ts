import Application from './application';
import Debug from 'debug';
const debug = Debug('trpg:core');
import internal from './internal/internal';
import exitHook from 'async-exit-hook';
import { setGlobalApplication } from 'lib/application';

type Config = {
  [name: string]: string | number | {};
};

require('./utils'); // 引入工具拓展

export default function createApplication(conf: Config): Application {
  const app = new Application();

  setConfig(app, conf);

  // 注册内部模块
  app.load(internal);

  exitHook(async (cb) => {
    console.log('正在关闭应用...');
    await app.close();
    console.log('应用关闭成功!');
    cb();
  });

  setGlobalApplication(app);

  return app;
}

function setConfig(app: Application, conf: Config) {
  if (!conf) {
    return;
  }

  for (let key in conf) {
    app.set(key, conf[key]);
  }
}
