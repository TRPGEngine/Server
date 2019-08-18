import { EventFunc } from '../socket';
import { CoreGlobalConfig } from './models/global-config';

const GLOBAL_CONFIG_CACHE_KEY = 'global:config';

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
