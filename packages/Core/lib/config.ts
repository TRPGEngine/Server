import { Etcd3, Watcher } from 'etcd3';
import { getObjectLeafs } from 'lib/helper/object-helper';
import Debug from 'debug';
const debug = Debug('trpg:config');
import localConfig from 'config';
import _ from 'lodash';
import { getLogger } from './logger';
import { tryParseJSON } from 'lib/helper/string-helper';
const logger = getLogger();

// TODO: 尚未实装

class AppConfig {
  protected config: { [key: string]: any };

  get<T = string | number | any>(path: string, defaultValue: any = ''): T {
    return _.get<any, any, T>(this.config, path, defaultValue);
  }
}

export class Etcd3Config extends AppConfig {
  private client: Etcd3;
  private prefix = _.get(localConfig, ['etcd', 'prefix']);

  constructor() {
    super();
    this.client = new Etcd3({
      // etcd host
      hosts: 'http://127.0.0.1:2379',
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
    async (defaultConfig: any): Promise<number> => {
      this.config = defaultConfig;
      const configLeafs = getObjectLeafs(defaultConfig);

      const pl = await Promise.all(
        configLeafs.map(async (leaf) => {
          const str = await this.remoteGet(leaf.path);
          if (str === null) {
            await this.remoteSet(leaf.path, leaf.value);
            return true;
          } else {
            _.set(this.config, leaf.path, tryParseJSON(str)); // 应用远程配置
            return false;
          }
        })
      );

      const count = pl.filter(Boolean).length;

      logger.info(`配置应用完毕, 应用 ${count} 条默认配置`);

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
          debug(`[etcd] update ${key}: ${value}`);

          _.set(this.config, key, tryParseJSON(value));
        } catch (err) {
          logger.error('etcd update', err);
        }
      });
  });

  stopWatch = _.once(async () => {
    if (_.isNil(this._watcher)) {
      logger.info('[etcd] Cannot find watcher');
      return;
    }
    await this._watcher.cancel();
  });

  async stop() {
    await this.stopWatch();
    this.client.close();
  }

  async remoteGetAll() {
    const allConfig = await this.client.getAll().prefix(this.prefix).strings();

    return allConfig;
  }

  async remoteGet(key: string): Promise<string | null> {
    debug(`get ${this.prefix + key}`);
    const data = await this.client.get(this.prefix + key).string();

    return data;
  }

  async remoteSet(key: string, value: any) {
    debug(`set ${this.prefix + key}`);
    await this.client.put(this.prefix + key).value(JSON.stringify(value));
  }
}
