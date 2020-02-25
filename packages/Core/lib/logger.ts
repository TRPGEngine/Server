import log4js, { Logger } from 'log4js';
import config from 'config';
import _ from 'lodash';

const appenders = {
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
};

// 以下是默认日志服务的备用项
// key 应该为config 中logger.type配置
// loggly
const logglyConf = _.get(config, 'logger.loggly');
if (!_.isEmpty(logglyConf.token)) {
  appenders['loggly'] = {
    type: '@log4js-node/loggly',
    token: logglyConf.token,
    subdomain: logglyConf.subdomain,
    tags: logglyConf.tags,
  };
}

// 额外的日志类型, 如果不为local则增加额外日志
const extraLoggerType = _.get(config, 'logger.type', 'local');
const defaultLoggerAppenders = ['datelog'];
if (
  extraLoggerType !== 'local' &&
  _.keys(appenders).includes(extraLoggerType)
) {
  defaultLoggerAppenders.push(extraLoggerType);
}

interface LoggerList {
  [loggerName: string]: Logger;
}

log4js.configure({
  appenders,
  categories: {
    default: { appenders: defaultLoggerAppenders, level: 'debug' },
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

/**
 * 关闭日志，确保退出时能完成所有的异步操作
 */
export function closeLogger(): Promise<void> {
  return new Promise((resolve, reject) => {
    log4js.shutdown((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
