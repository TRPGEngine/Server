import { TRPGApplication } from 'trpg/core';

let _application: TRPGApplication;

/**
 * 获取全局的Application
 */
export function getGlobalApplication(): TRPGApplication {
  return _application;
}

/**
 * 设置全局的Application实例
 * @param app 应用实例
 */
export function setGlobalApplication(app: TRPGApplication): void {
  _application = app;
}
