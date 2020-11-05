import { Etcd3 } from 'etcd3';
import { getObjectLeafs } from 'lib/helper/object-helper';

// TODO 尚未实装

class AppConfig {}

export class Etcd3Config extends AppConfig {
  private client: Etcd3;
  private prefix = 'trpg/config/';

  constructor() {
    super();
    this.client = new Etcd3({
      // etcd host
      hosts: 'http://127.0.0.1:2379',
    });
  }

  /**
   * 初始化时尝试将默认配置写入etcd
   * @param defaultConfig 默认配置
   */
  async checkAndApplyDefault(defaultConfig: any): Promise<number> {
    const configLeafs = getObjectLeafs(defaultConfig);

    const pl = await Promise.all(
      configLeafs.map(async (leaf) => {
        const str = await this.get(leaf.path);
        if (str === null) {
          await this.set(leaf.path, leaf.value);
          return true;
        } else {
          return false;
        }
      })
    );

    const count = pl.filter(Boolean).length;

    console.log(`配置应用完毕, 应用 ${count} 条配置`);

    return count;
  }

  async getAll() {
    const allConfig = await this.client.getAll().prefix(this.prefix).strings();

    return allConfig;
  }

  async get(key: string): Promise<string | null> {
    const data = await this.client.get(this.prefix + key).string();

    return data;
  }

  async set(key: string, value: any) {
    await this.client.put(this.prefix + key).value(JSON.stringify(value));
  }
}
