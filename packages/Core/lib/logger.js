const log4js = require('log4js');
log4js.configure({
  appenders: {
    datelog: {
      "type": "dateFile",
      "filename": "./logs/",
      "pattern": "debug/yyyyMMddhh.log",
      // "absolute": false,
      "alwaysIncludePattern": true,
      "compress": true,
    },
    app: {
      type: 'file',
      filename: './logs/app.log',
      maxLogSize: 1024 * 1024,// 1Mb
      backups: 3
    },
    error: {
      type: 'file',
      filename: './logs/error.log',
      maxLogSize: 1024 * 1024,// 1Mb
      backups: 3
    }
  },
  categories: {
    default: { appenders: ['datelog'], level: 'debug' },
    application: { appenders: ['app'], level: 'debug' },
    error: { appenders: ['error'], level: 'error' },
  }
})
let defaultLogger = null;
let loggers = {};

function getDefaultLogger(loggerName) {
  if(loggerName) {
    if(!!loggers[loggerName]) {
      return loggers[loggerName];
    }else {
      loggers[loggerName] = log4js.getLogger(loggerName);
      // loggers[loggerName].level = 'debug';
      return loggers[loggerName];
    }
  }else {
    if(!!defaultLogger) {
      return defaultLogger;
    }else {
      defaultLogger = log4js.getLogger();
      // defaultLogger.level = 'debug';
      return defaultLogger;
    }
  }
}

module.exports = getDefaultLogger;
