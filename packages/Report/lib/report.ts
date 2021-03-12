import Debug from 'debug';
const debug = Debug('trpg:component:report');
import schedule from 'node-schedule';
import reports from './reports';
import ReportErrorDefinition from './models/error';
import BasePackage from 'lib/package';
import reportRouter from './routers/report';

export default class Report extends BasePackage {
  public name: string = 'Report';
  public require: string[] = ['Player', 'Chat'];
  public desc: string = '统计模块';

  onInit() {
    this.initStorage();
    this.initRouters();
    this.initTimer();
  }

  initStorage() {
    const registerAll = (model) => {
      // 注册所有模型
      for (let k in model) {
        this.regModel(model[k]);
      }
    };

    this.regModel(ReportErrorDefinition);
    registerAll(require('./models/register'));
    registerAll(require('./models/chatlog'));
    registerAll(require('./models/login-times'));
  }

  initRouters() {
    this.regRoute(reportRouter);
  }

  initTimer() {
    const app = this.app;

    // TODO: 需要将其注册到app里而不是单独弄一套计划任务
    const dailyReport = schedule.scheduleJob('0 0 2 * * *', async () => {
      // 每日2点
      const end = new Date();
      end.setHours(0, 0, 0, 0);
      const start = new Date(end.valueOf() - 1000 * 60 * 60 * 24);
      debug(
        'run daily report: [%s, %s]',
        start.toISOString(),
        end.toISOString()
      );

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
    const weeklyReport = schedule.scheduleJob('0 0 2 * * MON', async () => {
      // 每周一2点
      const end = new Date();
      end.setHours(0, 0, 0, 0);
      const start = new Date(end.valueOf() - 1000 * 60 * 60 * 24 * 7);
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
    const monthlyReport = schedule.scheduleJob('0 0 2 1 * *', async () => {
      // 每月1日2点
      const end = new Date();
      end.setHours(0, 0, 0, 0);
      const start = new Date(end);
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

    this.regCloseTask(async () => {
      dailyReport.cancel();
      weeklyReport.cancel();
      monthlyReport.cancel();
    });
  }
}
