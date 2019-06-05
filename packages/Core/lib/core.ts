import Application from './application';
import Debug from 'debug';
const debug = Debug('trpg:core');

type Config = {
  [name: string]: string | number | {};
};

require('./utils'); // 引入工具拓展

export default function createApplication(conf: Config): Application {
  const app = new Application();

  setConfig(app, conf);

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
