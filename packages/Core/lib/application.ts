import Debug from 'debug';
const debug = Debug('trpg:application');
const schedule = require('node-schedule');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const _ = require('lodash');
const { IOSessionMiddleware } = require('./utils/iosession');
const Storage = require('./storage');
const { Cache, RedisCache } = require('./cache');
const ReportService = require('./report');
const WebService = require('./webservice');
const SocketService = require('./socket');
const logger = require('./logger')();
const appLogger = require('./logger')('application');

let app: any = (exports = module.exports = {});
app.engines = {};
app.settings = {}; // 设置配置列表
app.storage = null; // 数据库服务列表
app.cache = null; // 缓存服务
app.reportservice = null; // 汇报服务
app.webservice = null; // 网页服务
app.socketservice = null; // websocket服务
app.components = []; // 组件列表
app.events = {}; // 内部事件列表
app.timers = []; // 计时器列表
app.webApi = {}; // 网页服务api
app.statInfoJob = []; // 统计信息任务
app.job = null; // node-schedule定时任务
app.testcase = [];

app.run = function run() {
  // TODO 启动检测，如果为第一次启动则初始化。如果非第一次启动则重新开启（保留之前配置）
  this.init();
};

app.init = function init() {
  this.setMaxListeners(20); // 设置事件监听数量
  this.defaultConfiguration();
  this.initReportService();
  this.initWebService();
  this.initSocketService();
  this.initStorage();
  this.initCache();
  this.initStatJob();
  this.initComponents();

  applog('init completed!');
  this.emit('initCompleted', this);
  this.webservice.listen();
};

app.defaultConfiguration = function defaultConfiguration() {
  let env = process.env.NODE_ENV || 'development';
  let port = process.env.PORT || '23256';
  let apihost = process.env.HOST || 'https://trpgapi.moonrailgun.com'; // 后台服务的对外接口, 用于外部服务
  let verbose = false;
  if (process.env.VERBOSE && process.env.VERBOSE.toLowerCase() === 'true') {
    verbose = true;
  }

  this.setDefault('env', env);
  this.setDefault('port', port);
  this.setDefault('apihost', apihost);
  this.setDefault('verbose', verbose);
  this.setDefault('webserviceHomepage', '');
};

app.initReportService = function initReportService() {
  try {
    this.reportservice = new ReportService(this.get('report'));
    applog('create report service success!');
  } catch (err) {
    console.error('create report error:');
    throw err;
  }
};

app.initWebService = function initWebService() {
  try {
    let port = Number(this.set('port'));
    this.webservice = new WebService({
      app: this,
      port,
      webApi: this.webApi,
      homepage: this.get('webserviceHomepage'),
    });
    applog('create webservice(%d) success!', port);
  } catch (err) {
    console.error('create webservice error:');
    throw err;
  }
};

app.initSocketService = function initSocketService() {
  const socketservice = new SocketService(this);
  socketservice.use(
    IOSessionMiddleware(this.webservice._app, this.webservice.sessionOpt)
  );
  socketservice.initIOEvent();
  this.socketservice = socketservice;
  this.on('disconnect', (socket) => {
    // 离线时移除之前的iosession
    socket.iosession.destroy();
  });
};

app.initStorage = function initStorage() {
  let opts = {};

  let dbconfig = app.get('db');
  this.storage = new Storage(dbconfig);
};
app.initCache = function initCache() {
  let redisUrl = app.get('redisUrl');
  if (redisUrl) {
    this.cache = new RedisCache({ url: redisUrl });
  } else {
    this.cache = new Cache();
  }
};
app.initStatJob = function initStatJob() {
  let run = async () => {
    try {
      applog('start statistics project info...');
      let info: any = {};
      for (let job of this.statInfoJob) {
        let name = job.name;
        let fn = job.fn;
        let res = await fn();
        applog('|- [%s]:%o', name, res);
        if (res) {
          info[name] = res;
        }
      }
      info._updated = new Date().getTime();
      await fs.writeJson(path.resolve(process.cwd(), './stat.json'), info, {
        spaces: 2,
      });
      applog('statistics completed!');
    } catch (e) {
      console.error('statistics error:', e);
      this.error(e);
    }
  };

  // 每天凌晨2点统计一遍
  this.job = schedule.scheduleJob('0 0 2 * * *', run);
  // schedule.scheduleJob('1 * * * * *', run); // just for test
};

app.initComponents = function initComponents() {
  for (let component of this.components) {
    try {
      applog('initing ...%o', component);
      let componentInfo = component.call(this, this);
      applog('component info:', componentInfo);
    } catch (e) {
      console.warn(`component init error when ${component}:\n`);
      throw e;
    }
  }
};

// eventFn is async/await fn
app.register = function(appEventName, eventFn) {
  if (!!this.events[appEventName]) {
    this.events[appEventName].push(eventFn);
  } else {
    this.events[appEventName] = [eventFn];
  }
};

app.registerEvent = function(eventName, eventFn) {
  this.socketservice.registerIOEvent(eventName, eventFn);
};

// loopNum 循环次数,不传则为无限循环
app.registerTimer = function(fn, millisec, loopNum) {
  var indexNum = 0;
  let timer = setInterval(function() {
    fn();
    indexNum++;
    if (!!loopNum && loopNum >= indexNum) {
      clearInterval(timer);
    }
  }, millisec);

  this.timers.push(timer);
};

// 只执行一次的计时器
// 用于替代系统默认的setTimeout
app.registerTimerOnce = function(fn, millisec) {
  this.registerTimer(fn, millisec, 1);
};

app.registerWebApi = function(path, fn) {
  this.webApi[path] = fn;
};

app.registerStatJob = function(statName, statCb) {
  for (let s of this.statInfoJob) {
    if (s.name === statName) {
      applog(`stat info [${statName}] has been registered`);
      return;
    }
  }

  applog('register stat job [%s]', statName);
  this.statInfoJob.push({
    name: statName,
    fn: statCb,
  });
};

app.request = {
  get(url, query, config) {
    return axios(
      Object.assign(
        {},
        {
          url,
          method: 'get',
          params: query,
        },
        config
      )
    ).then((res) => {
      applog('[request GET]', url, query, res.status);
      appLogger.info('\t[request res detail]:', res);
      return res.data;
    });
  },
  post(url, data, config) {
    return axios(
      Object.assign(
        {},
        {
          url,
          method: 'post',
          data,
        },
        config
      )
    ).then((res) => {
      applog('[request POST]', url, data, res.status);
      appLogger.info('\t[request res detail]:', res);
      return res.data;
    });
  },
};

// 记录错误
app.error = function(err) {
  console.error('Error', err);
  this.reportservice.reportError(err);
};

app.errorWithContext = function(err, context) {
  this.reportservice.reportErrorWithContext(err, context);
};

app.close = async function(cb) {
  debug('closing....');
  await this.storage.close();
  this.io.close(cb);
  // 清理timer
  for (let timer of this.timers) {
    clearInterval(timer);
  }
  this.timers = [];
  this.job.cancel();
  this.cache.close(); // 关闭redis连接
  this.emit('close');
  debug('close completed!');
};

app.set = function set(setting, val) {
  if (arguments.length === 1) {
    return this.settings[setting];
  }

  applog('set "%s" to %o', setting, val);

  this.settings[setting] = val;

  return this;
};

app.setDefault = function setDefault(setting, val) {
  if (!this.settings[setting]) {
    applog('set "%s" to %o by default', setting, val);
    this.settings[setting] = val;
  }
  return this;
};

// 支持get('xxx.xxx')获取
app.get = function get(path, defaultValue = '') {
  return _.get(this.settings, path, defaultValue);
};

app.enabled = function enabled(setting) {
  return Boolean(this.set(setting));
};

app.disabled = function disabled(setting) {
  return !this.set(setting);
};

app.enable = function enable(setting) {
  return this.set(setting, true);
};

app.disable = function disable(setting) {
  return this.set(setting, false);
};

app.onconnect = function onconnect(cb) {
  if (cb) {
    throw new TypeError(`param must be a Function. this is a ${typeof cb}`);
  }

  if (this.io) {
    throw new Error('io is not initialized');
  }

  this.io.on('connection', cb);
};

app.load = function load(component) {
  let app = this;
  if (!!component && typeof component === 'function') {
    this.components.push(component);
    applog(
      'load component into comments list(length: %d). %o',
      this.components.length,
      component
    );
  } else {
    applog(`component must be a Function not a ${typeof component}`);
    throw new Error('Component load failed. Component must be a Function.');
  }
};

app.reset = async function reset({ force = false } = {}) {
  const app = this;
  const storage = app.storage;
  if (storage) {
    applog('start resetStorage');
    await storage.reset(force);
    let db = storage.db;
    try {
      if (!!app.events['resetStorage']) {
        for (let fn of app.events['resetStorage']) {
          await fn(storage, db);
        }
        applog('registered reset event completed!');
      }
    } catch (err) {
      console.error('reset storage error', err);
      throw err;
    }
  }
};

app.dbSync = async function dbSync() {
  let app = this;
  let storage = this.storage;
  if (storage) {
    applog('start sync storage');
    await storage.syncAsync();
  }
};

function applog(formatter, ...others) {
  debug(formatter, ...others);
  appLogger.info(formatter, ...others);
}

app.log = applog;
