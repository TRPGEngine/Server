import events from 'events';
import Debug from 'debug';
const debug = Debug('trpg:application');
import schedule, { Job } from 'node-schedule';
import fs from 'fs-extra';
import path from 'path';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosPromise } from 'axios';
import _ from 'lodash';
import { IOSessionMiddleware } from './utils/iosession';
import Storage, { TRPGDbOptions } from './storage';
import { Cache, RedisCache, ICache } from './cache';
import ReportService from './report';
import WebService from './webservice';
import SocketService, { EventFunc } from './socket';
import { getLogger, closeLogger } from './logger';
const logger = getLogger();
const appLogger = getLogger('application');
import BasePackage from 'lib/package';
import { CoreSchedulejobRecord } from './internal/models/schedulejob-record';

type AppSettings = {
  [key: string]: string | number | {};
};

type InternalEventFunc = (...args: any) => Promise<void>;
type InternalEvents = {
  [eventName: string]: Array<InternalEventFunc>;
};

export type CloseTaskFunc = () => Promise<void>;
type CloseTasks = {
  [packageName: string]: CloseTaskFunc;
};

type ScheduleJob = {
  name: string;
  job: Job;
};

type ScheduleJobFnRet = void | string;
export type ScheduleJobFn = (
  fireDate: Date
) => Promise<ScheduleJobFnRet> | ScheduleJobFnRet;

export class Application extends events.EventEmitter {
  settings: AppSettings = {}; // 设置配置列表
  storage: Storage = null; // 数据库服务列表
  cache: ICache = null; // 缓存服务
  reportservice: ReportService = null; // 汇报服务
  webservice: WebService = null; // 网页服务
  socketservice: SocketService = null; // websocket服务
  components: BasePackage[] | Function[] = []; // 组件列表
  installedPackages: string[] = []; // 安装的组件名列表
  events: InternalEvents = {}; // 内部事件列表
  timers = []; // 计时器列表
  webApi = {}; // 网页服务api
  statInfoJob = []; // 统计信息任务
  job: Job = null; // node-schedule定时任务(每日凌晨2点)
  scheduleJob: ScheduleJob[] = []; // 计划任务列表
  closeTasks: CloseTasks = {}; // 关闭任务队列(当触发关闭应用时执行这些任务)
  testcase = [];
  [packageInject: string]: any; // 包注入的方法

  get io() {
    return this.socketservice;
  }

  run() {
    // TODO 启动检测，如果为第一次启动则初始化。如果非第一次启动则重新开启（保留之前配置）
    this.init();
  }

  init() {
    this.setMaxListeners(20); // 设置事件监听数量
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
  }

  initReportService() {
    try {
      this.reportservice = new ReportService(this);
      applog('create report service success!');
    } catch (err) {
      console.error('create report error:');
      throw err;
    }
  }

  initWebService() {
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
  }

  initSocketService() {
    const socketservice = new SocketService(this);
    socketservice.use(
      IOSessionMiddleware(this.webservice.app, this.webservice.sessionOpt)
    );
    socketservice.initIOEvent();
    // TODO: 增加一个定时任务，定期记录事件平均耗时

    this.socketservice = socketservice;
    this.on('disconnect', (socket) => {
      // 离线时移除之前的iosession
      socket.iosession.destroy();
    });
  }

  initStorage() {
    const dbconfig = this.get('db') as TRPGDbOptions;
    this.storage = new Storage(dbconfig, this);
  }
  initCache() {
    const redisUrl = this.get('redisUrl').toString();
    if (redisUrl) {
      this.cache = new RedisCache({ url: redisUrl });
    } else {
      this.cache = new Cache();
    }
  }
  initStatJob() {
    const run = () =>
      this.cache.lockScope(
        'core:statjob',
        async () => {
          applog('start statistics project info...');
          const record = await CoreSchedulejobRecord.createRecord(
            'stat-info',
            'stat'
          );
          try {
            const info: any = {};
            for (let job of this.statInfoJob) {
              const name = job.name;
              const fn = job.fn;
              const res = await fn();
              applog('|- [%s]:%o', name, res);
              if (res) {
                info[name] = res;
              }
            }
            info._updated = new Date().getTime();
            await fs.writeJson(
              path.resolve(process.cwd(), './stat.json'),
              info,
              {
                spaces: 2,
              }
            );

            // 记录结果
            record.completed = true;
            record.result = JSON.stringify(info);
            record.save();
            applog('statistics completed!');
          } catch (e) {
            console.error('statistics error:', e);
            this.error(e);

            // 记录结果
            record.completed = false;
            record.result = String(e);
            record.save();
          }
        },
        {
          unlockDelay: 2000,
        }
      );

    // 每天凌晨2点统计一遍
    this.job = schedule.scheduleJob('0 0 2 * * *', run);
    // schedule.scheduleJob('1 * * * * *', run); // just for test
  }

  initComponents() {
    for (let component of this.components) {
      try {
        const isNewPackage = component instanceof BasePackage; // 检测是否为新版包
        if (!isNewPackage) {
          // 旧版包处理
          applog('initing ...%o', component);
          let componentInfo = (component as Function).call(this, this);
          applog('component info:', componentInfo);
        } else {
          // 新版包处理
          const instance = component as BasePackage;
          const componentName = instance.name;
          applog('initing ...%s', componentName);
          instance.onInit();
          instance.onInitCompleted();
          this.installedPackages.push(componentName);
          applog('component info:', {
            name: componentName,
            require: instance.require,
          });
        }
      } catch (e) {
        console.warn(`component init error when ${component}:\n`);
        throw e;
      }
    }
  }

  // eventFn is async/await fn
  register(appEventName: string, eventFn: InternalEventFunc) {
    if (!!this.events[appEventName]) {
      this.events[appEventName].push(eventFn);
    } else {
      this.events[appEventName] = [eventFn];
    }
  }

  registerEvent(eventName: string, eventFn: EventFunc) {
    this.socketservice.registerIOEvent(eventName, eventFn);
  }

  // loopNum 循环次数,不传则为无限循环
  registerTimer(fn: () => void, millisec: number, loopNum?: number) {
    let indexNum = 0;
    const timer = setInterval(() => {
      fn();
      indexNum++;
      if (!!loopNum && loopNum >= indexNum) {
        clearInterval(timer);
        const i = this.timers.findIndex((v) => v === timer);
        this.timers.splice(i, 1); // 删除该项
      }
    }, millisec);

    this.timers.push(timer);
  }

  // 只执行一次的计时器
  // 用于替代系统默认的setTimeout
  registerTimerOnce(fn: () => void, millisec: number) {
    this.registerTimer(fn, millisec, 1);
  }

  registerWebApi(path, fn) {
    this.webApi[path] = fn;
  }

  registerStatJob(statName: string, statCb) {
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
  }

  /**
   * 注册计划任务
   * @param name 计划任务名
   * @param rule 计划任务执行规则
   * @param fn 计划任务方法
   */
  registerScheduleJob(name: string, rule: string, fn: ScheduleJobFn) {
    for (let s of this.scheduleJob) {
      if (s.name === name) {
        applog(`schedule job [${name}] has been registered`);
        return;
      }
    }

    const job = schedule.scheduleJob(name, rule, (fireDate: Date) => {
      // 计划任务方法
      this.cache.lockScope(
        `core:scheduleJob:${name}`,
        async () => {
          const record = await CoreSchedulejobRecord.createRecord(
            name,
            'schedule'
          );
          try {
            applog(`start schedule job ${name}`);
            const result = await fn(fireDate);
            record.completed = true;
            record.result = result || null;
            record.save();
          } catch (err) {
            console.error('schedule job error:', err);
            this.error(err);
            record.completed = false;
            record.result = String(err);
            record.save();
          }
        },
        {
          unlockDelay: 2000,
        }
      );
    });
    applog(
      'register schedule job [%s](nextDate: %o)',
      name,
      job.nextInvocation()
    );
    this.scheduleJob.push({
      name,
      job,
    });
  }

  /**
   * 注册关闭事件， 当应用进程退出时执行
   * @param fn 事件方法
   */
  registerCloseTask(packageName: string, fn: CloseTaskFunc): void {
    if (this.closeTasks[packageName]) {
      debug(`add [${packageName}] close task failed: exist one`);
      return;
    }
    debug(`add [${packageName}] close task`);
    this.closeTasks[packageName] = fn;
  }

  /**
   * 注册脱敏字段
   */
  registerSocketDataMask(eventName: string, fieldName: string) {
    this.io.registerSocketDataMask(eventName, fieldName);
  }

  request = {
    get: <T = any>(
      url: string,
      query?: any,
      config?: AxiosRequestConfig
    ): any => {
      debug('[GET]%s:%o', url, query);
      return axios({
        url,
        method: 'get',
        params: query,
        ...config,
      })
        .then((res: AxiosResponse<T>) => {
          applog('[request GET]', url, query, res.status);
          appLogger.info('\t[request res detail]:', res);
          return res.data;
        })
        .catch((err) => {
          this.errorWithContext(err, {
            url,
            query,
            config,
          });
        });
    },
    post: <T = any>(
      url: string,
      data: any,
      config?: AxiosRequestConfig
    ): any => {
      debug('[POST]%s:%o', url, data);
      return axios({
        url,
        method: 'post',
        data,
        ...config,
      })
        .then((res: AxiosResponse<T>) => {
          applog('[request POST]', url, data, res.status);
          appLogger.info('\t[request res detail]:', res);
          return res.data;
        })
        .catch((err) => {
          this.errorWithContext(err, {
            url,
            data,
            config,
          });
        });
    },
  };

  /**
   * 检测是否注册了某个组件
   * 大小写不限
   * @param componentName 组件名
   */
  hasPackage(componentName: string): boolean {
    return this.installedPackages
      .map(_.lowerCase)
      .includes(_.lowerCase(componentName));
  }

  // 记录错误
  error(err) {
    this.reportservice.reportError(err);
  }

  errorWithContext(err, context) {
    this.reportservice.reportErrorWithContext(err, context);
  }

  async close() {
    debug('closing....');

    if (!_.isNil(this.socketservice)) {
      await this.socketservice
        .close()
        .then(() => debug('closed socketservice success'));
    }

    if (!_.isNil(this.webservice)) {
      // NOTE: 这里是一个冗余操作
      // 如果socketservice共用webservice的话。在socketservice关闭时同时会关闭webservice
      await this.webservice
        .close()
        .then(() => debug('closed webservice success'));
    }

    for (let timer of this.timers) {
      // 清理timer
      clearInterval(timer);
    }
    this.timers = [];

    if (!_.isNil(this.job) && _.isFunction(this.job.cancel)) {
      this.job.cancel();
    }
    this.scheduleJob.forEach(({ job }) => job.cancel()); // 关闭计划任务列表
    debug('closed all scheduleJob');

    try {
      await closeLogger(); // 关闭日志
      debug('shutdown all logger');
    } catch (e) {
      console.error('关闭日志出现异常', e);
    }

    // 执行关闭事件
    await Promise.all(
      Object.entries(this.closeTasks).map(([packageName, fn]) =>
        fn()
          .then(() => debug(`closeTask: [${packageName}] success`))
          .catch((err) => debug(`closeTask: [${packageName}] error %o`, err))
      )
    ).then(() => debug('completed all close task'));
    this.emit('close');

    if (!_.isNil(this.cache)) {
      // 关闭redis连接
      this.cache.close();
    }

    if (!_.isNil(this.storage)) {
      // 关闭存储服务
      await this.storage.close().then(() => debug('closed storage service'));
    }

    debug('close completed!');
  }

  set(setting, val?) {
    if (arguments.length === 1) {
      return this.settings[setting];
    }

    applog('set "%s" to %o', setting, val);

    this.settings[setting] = val;

    return this;
  }

  /**
   * 支持get('xxx.xxx')获取
   * @param path 路径
   * @param defaultValue 默认值, 默认为''
   */
  get<T = string | number | any>(path: string, defaultValue: any = ''): T {
    return _.get<any, any, T>(this.settings, path, defaultValue);
  }

  enabled(setting: string) {
    return Boolean(this.set(setting));
  }

  disabled(setting: string) {
    return !this.set(setting);
  }

  enable(setting: string) {
    return this.set(setting, true);
  }

  disable(setting: string) {
    return this.set(setting, false);
  }

  onconnect(cb) {
    if (cb) {
      throw new TypeError(`param must be a Function. this is a ${typeof cb}`);
    }

    if (!this.socketservice) {
      throw new Error('socketservice is not initialized');
    }

    this.socketservice.on('connection', cb);
  }

  load(component) {
    let app = this;
    if (!!component && typeof component === 'function') {
      if (BasePackage.isPrototypeOf(component)) {
        // 新包onLoad处理
        component = new component(this);
        (component as BasePackage).onLoad();
        applog(
          'load component into components list(index: %d). %s',
          this.components.length,
          component.name
        );
      } else {
        // 旧包处理
        applog(
          'load component into components list(index: %d). %o',
          this.components.length,
          component
        );
      }
      this.components.push(component);
    } else {
      applog(`component must be a Function not a ${typeof component}`);
      throw new Error('Component load failed. Component must be a Function.');
    }
  }

  async reset({ force = false } = {}) {
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
  }

  log = applog;

  jwtSign = (payload: any) => this.webservice.jwtSign(payload);
  jwtVerify = (token: string) => this.webservice.jwtVerify(token);
}
export default Application;

function applog(formatter, ...others) {
  debug(formatter, ...others);
  appLogger.info(formatter, ...others);
}
