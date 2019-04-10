const Raven = require('raven');
const appLogger = require('./logger')('application');
const errorLogger = require('./logger')('error');

module.exports = Report;

// 默认设置
const defaultConfig = {
  logger: true,
  sentry: false, // 如果有则为Sentry DSN http://xxxxxxx@sentry.xxxxx.com/x 格式
}

function Report(reportSetting) {
  this._setting = Object.assign({}, defaultConfig, reportSetting);
  if(this._setting.sentry) {
    Raven.config(this._setting.sentry).install();
  }
}

Report.prototype.reportError = function(err, options = null) {
  const setting = this._setting;
  if(setting.logger) {
    errorLogger.error(err)
  }

  if(setting.sentry) {
    let errorFn;
    if (typeof err === 'string') {
      // 如果不是一个错误类型的。提交错误文本信息到sentry
      errorFn = Raven.captureMessage.bind(Raven);
    }else {
      errorFn = Raven.captureException.bind(Raven);
    }
    errorFn(err, options, function (err, eventId) {
      console.log('[Sentry] Reported error: ' + eventId);
      appLogger.info('[Sentry] Reported error: ' + eventId);
    });
  }
}

Report.prototype.reportErrorWithContext = function (err, context = {}) {
  Raven.context(() => {
    Raven.setContext(context);
    this.reportError(err);
  })
}
