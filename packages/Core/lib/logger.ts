import log4js, { Logger } from 'log4js';

interface LoggerList {
  [loggerName: string]: Logger;
}

log4js.configure({
  appenders: {
    datelog: {
      type: 'dateFile',
      filename: './logs/debug/log',
      pattern: 'yyyyMMddhh',
      // "absolute": false,
      alwaysIncludePattern: true,
      compress: true,
    },
    app: {
      type: 'file',
      filename: './logs/app.log',
      maxLogSize: 1024 * 1024, // 1Mb
      backups: 3,
    },
    error: {
      type: 'file',
      filename: './logs/error.log',
      maxLogSize: 1024 * 1024, // 1Mb
      backups: 3,
    },
  },
  categories: {
    default: { appenders: ['datelog'], level: 'debug' },
    application: { appenders: ['app'], level: 'debug' },
    error: { appenders: ['error'], level: 'error' },
  },
});
let defaultLogger: Logger = null;
let loggers: LoggerList = {};

export function getLogger(loggerName?: string): Logger {
  if (loggerName) {
    if (!!loggers[loggerName]) {
      return loggers[loggerName];
    } else {
      loggers[loggerName] = log4js.getLogger(loggerName);
      // loggers[loggerName].level = 'debug';
      return loggers[loggerName];
    }
  } else {
    if (!!defaultLogger) {
      return defaultLogger;
    } else {
      defaultLogger = log4js.getLogger();
      // defaultLogger.level = 'debug';
      return defaultLogger;
    }
  }
}
