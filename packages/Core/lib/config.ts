import { Etcd3, Watcher } from 'etcd3';
import { getObjectLeafs } from 'lib/helper/object-helper';
import Debug from 'debug';
const debug = Debug('trpg:config');
import localConfig from 'config';
import _ from 'lodash';
import { getLogger } from './logger';
import { tryParseJSON } from 'lib/helper/string-helper';
const logger = getLogger();

export abstract class AppConfig {
  protected config: { [key: string]: any };
  type = 'unknown';

  async init() {}

  get<T = string | number | any>(path: string, defaultValue: any = ''): T {
    return _.get<any, any, T>(this.config, path, defaultValue);
  }
}

class LocalConfig extends AppConfig {
  type = 'local';
  config = localConfig.util.toObject(localConfig);
}

class Etcd3Config extends AppConfig {
  type = 'etcd3';
  private client: Etcd3;
  private prefix = _.get(localConfig, ['etcd', 'prefix']);

  constructor() {
    super();
    this.client = new Etcd3({
      // etcd host
      hosts: _.get(localConfig, ['etcd', 'host']),
    });
  }

  init = _.once(async () => {
    await this.checkAndApplyDefault(localConfig.util.toObject(localConfig));
    await this.startWatch();
  });

  /**
   * 初始化时尝试将默认配置写入etcd
   * @param defaultConfig 默认配置
   */
  checkAndApplyDefault = _.once(
    async (defaultConfig: {}): Promise<number> => {
      this.config = defaultConfig;
      const configLeafs = getObjectLeafs(defaultConfig);

      const pl = await Promise.all(
        configLeafs.map(async (leaf) => {
          const str = await this.remoteGet(leaf.path);
          if (str === null) {
            // 将本地配置同步到远程
            this.remoteSet(leaf.path, leaf.value); // 不在乎返回结果
            return true;
          } else {
            _.set(this.config, leaf.path, tryParseJSON(str)); // 应用远程配置
            return false;
          }
        })
      );

      const count = pl.filter(Boolean).length;

      logger.info(`配置应用完毕, 应用 ${count} 条默认配置`);
      debug('配置信息: %O', this.config);

      return count;
    }
  );

  _watcher: Watcher | undefined;
  startWatch = _.once(async () => {
    this._watcher = await this.client.watch().prefix(this.prefix).create();

    this._watcher
      .on('disconnected', () => debug('[etcd] disconnected...'))
      .on('connected', () => debug('[etcd] successfully reconnected!'))
      .on('put', (kv) => {
        try {
          const key = String(kv.key).replace(this.prefix, '');
          const value = String(kv.value);
          debug(`[etcd3]: update local ${key}: ${value}`);

          _.set(this.config, key, tryParseJSON(value));
        } catch (err) {
          logger.error('etcd update error:', err);
        }
      });
  });

  stopWatch = _.once(async () => {
    if (_.isNil(this._watcher)) {
      logger.info('[etcd3]: Cannot find watcher');
      return;
    }
    await this._watcher.cancel();
  });

  async stop() {
    await this.stopWatch();
    this.client.close();
  }

  async remoteGetAll() {
    debug(`[etcd3]: getAll`);
    const allConfig = await this.client.getAll().prefix(this.prefix).strings();

    return allConfig;
  }

  async remoteGet(key: string): Promise<string | null> {
    debug(`[etcd3]: get ${this.prefix + key}`);
    const data = await this.client.get(this.prefix + key).string();

    return data;
  }

  async remoteSet(key: string, value: any) {
    debug(`[etcd3]: set ${this.prefix + key}`);
    await this.client.put(this.prefix + key).value(JSON.stringify(value));
  }
}

/**
 * 根据配置返回config服务
 */
export function getConfigService(): AppConfig {
  if (_.get(localConfig, ['etcd', 'enable']) === true) {
    debug('Using etcd3 config');
    return new Etcd3Config();
  }

  debug('Using local config');
  return new LocalConfig();
}

/**
 * 强制返回本地配置
 * 用于测试环境
 */
export function getLocalConfigService() {
  return new LocalConfig();
}
