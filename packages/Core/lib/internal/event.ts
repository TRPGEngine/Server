import { EventFunc } from '../socket';
import { CoreGlobalConfig } from './models/global-config';
import packageInfo from '../../../../package.json';

const GLOBAL_CONFIG_CACHE_KEY = 'global:config';

/**
 * 获取全局的配置信息
 */
export const getGlobalConfig: EventFunc = async function(data, cb, db) {
  const app = this.app;
  const globalConfig = await app.cache.get(GLOBAL_CONFIG_CACHE_KEY);

  if (globalConfig) {
    return { config: globalConfig };
  }

  const config = await CoreGlobalConfig.findAll();
  await app.cache.set(GLOBAL_CONFIG_CACHE_KEY, config);
  return { config };
};

/**
 * 健康检查
 */
export const health: EventFunc = async function(data, cb, db) {
  return { data, version: packageInfo.version };
};
