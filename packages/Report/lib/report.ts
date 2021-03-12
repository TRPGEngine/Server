import Debug from 'debug';
import { TRPGRouter } from 'trpg/core';
const debug = Debug('trpg:component:report');
import schedule from 'node-schedule';
import reports from './reports';
import ReportErrorDefinition from './models/error';

export default function ReportComponent(app) {
  initStorage.call(app);
  initRouters.call(app);
  initTimer.call(app);

  return {
    name: 'ReportComponent',
  };
}

function initStorage() {
  const app = this;
  const storage = app.storage;
  const registerAll = (model) => {
    // 将所有对象都注册到app.storage中
    let i = 0;
    for (let k in model) {
      storage.registerModel(model[k]);
      i++;
    }
    return i; // 返回注册数
  };

  storage.registerModel(ReportErrorDefinition);
  let count = 1;
  count += registerAll(require('./models/register'));
  count += registerAll(require('./models/chatlog'));
  count += registerAll(require('./models/login-times'));

  app.on('initCompleted', function (app) {
    // 数据信息统计
    debug(`storage has been load ${count} report db model`);
  });
}

function initRouters() {
  const app = this;
  const webservice = app.webservice;
  const router = new TRPGRouter();

  const report = require('./routers/report');

  router.use('/report', report.routes());
  webservice.use(router.routes());
}

function initTimer() {
  let app = this;

  // TODO: 需要将其注册到app里而不是单独弄一套计划任务
  let dailyReport = schedule.scheduleJob('0 0 2 * * *', async () => {
    // 每日2点
    let end = new Date();
    end.setHours(0, 0, 0, 0);
    let start = new Date(end.valueOf() - 1000 * 60 * 60 * 24);
    debug('run daily report: [%s, %s]', start.toISOString(), end.toISOString());

    const db = app.storage.db;
    for (let k in reports) {
      debug(' - execute task:', k);
      let report = reports[k];
      try {
        report.daily && (await report.daily.call(app, start, end, db));
      } catch (err) {
        app.error(err);
      }
    }
  });
  let weeklyReport = schedule.scheduleJob('0 0 2 * * MON', async () => {
    // 每周一2点
    let end = new Date();
    end.setHours(0, 0, 0, 0);
    let start = new Date(end.valueOf() - 1000 * 60 * 60 * 24 * 7);
    debug('run weekly report: [%s, %s]', start, end);

    const db = app.storage.db;
    for (let k in reports) {
      debug(' - execute task:', k);
      let report = reports[k];
      try {
        report.weekly && (await report.weekly.call(app, start, end, db));
      } catch (err) {
        app.error(err);
      }
    }
  });
  let monthlyReport = schedule.scheduleJob('0 0 2 1 * *', async () => {
    // 每月1日2点
    let end = new Date();
    end.setHours(0, 0, 0, 0);
    let start = new Date(end);
    start.setMonth(start.getMonth() - 1);
    debug('run monthly report: [%s, %s]', start, end);

    const db = app.storage.db;
    for (let k in reports) {
      debug(' - execute task:', k);
      let report = reports[k];
      try {
        report.monthly && (await report.monthly.call(app, start, end, db));
      } catch (err) {
        app.error(err);
      }
    }
  });

  debug('next daily report:', dailyReport.nextInvocation().toISOString());
  debug('next weekly report:', weeklyReport.nextInvocation().toISOString());
  debug('next monthly report:', monthlyReport.nextInvocation().toISOString());

  app.on('close', function () {
    dailyReport.cancel();
    weeklyReport.cancel();
    monthlyReport.cancel();
  });
}
