import * as Sentry from '@sentry/node';
import { getLogger } from './logger';
import { TRPGApplication } from '../types/app';
import { NoReportError } from 'lib/error';
const logger = getLogger();
const appLogger = getLogger('application');

interface ReportConfig {
  enable: boolean;
  logger: boolean;
  sentry: false | string;
}

type ReportErrorType = Error | string;

// 默认设置
const defaultConfig: ReportConfig = {
  enable: true,
  logger: true,
  sentry: false, // 如果有则为Sentry DSN http://xxxxxxx@sentry.xxxxx.com/x 格式
};

class ReportService {
  private _setting: ReportConfig;
  installed = false;

  constructor(app: TRPGApplication) {
    this._setting = Object.assign({}, defaultConfig, app.get('report'));
    if (this._setting.sentry) {
      Sentry.init({ dsn: this._setting.sentry, environment: app.get('env') });
      Sentry.setTags({
        apihost: app.get('apihost'),
        fileStorage: app.get('file.storage'),
      });
      this.installed = true;
    }
  }

  reportError(err: ReportErrorType, options = null) {
    console.error(err); // 在终端里输出一遍

    const setting = this._setting;
    if (!this._setting.enable) {
      // 未开启汇报系统
      return;
    }

    if (setting.logger) {
      logger.error(
        {
          tags: ['app'],
        },
        err
      );
    }

    if (this.installed) {
      if (err instanceof NoReportError) {
        // 如果是不上报的错误，则跳过
        return;
      }

      let errorFn;
      if (typeof err === 'string') {
        // 如果不是一个错误类型的。提交错误文本信息到sentry
        errorFn = Sentry.captureMessage.bind(Sentry);
      } else {
        errorFn = Sentry.captureException.bind(Sentry);
      }
      errorFn(err, options, function(err, eventId) {
        console.log('[Sentry] Reported error: ' + eventId);
        appLogger.info('[Sentry] Reported error: ' + eventId);
      });
    }
  }

  reportErrorWithContext(err: ReportErrorType, context = {}) {
    if (!this.installed) {
      return;
    }

    Sentry.configureScope((scope) => {
      scope.setContext('context', context);
      this.reportError(err);
    });
  }
}

export default ReportService;
