import { Etcd3Config } from '../lib/config';
import { Etcd3 } from 'etcd3';
import config from 'config';
import { sleep } from 'test/utils/utils';

test('placeholder', () => {
  expect(1 + 1).toBe(2);
});

describe.skip('Etcd3Config', () => {
  const etcdConfig = config.get<any>('etcd');
  if (etcdConfig.enable !== true) {
    return;
  }

  const prefix = etcdConfig.prefix;

  /**
   * 构建etcd 客户端处理器
   */
  async function buildEtcdClientHandler(
    handler: (client: Etcd3) => Promise<void> | void
  ) {
    const client = new Etcd3({
      hosts: etcdConfig.host, // etcd host
    });
    try {
      await handler(client);
    } finally {
      client.close();
    }
  }

  /**
   * 构建configservice测试用例
   */
  function buildConfigTester(
    tester: (configService: Etcd3Config) => Promise<void> | void
  ): () => Promise<void> {
    return async () => {
      const configService = new Etcd3Config();
      await configService.init();

      try {
        await tester(configService);
      } finally {
        await configService.stop();
      }
    };
  }

  afterEach(async () => {
    await buildEtcdClientHandler(async (client) => {
      await client.delete().prefix(prefix).exec();
    });
  });

  test(
    'get should be ok',
    buildConfigTester((configService) => {
      expect(configService.get('version')).toBe(config.get('version'));
    })
  );

  test(
    'config should be update if data is update in remote',
    buildConfigTester(async (configService) => {
      const testVersion = '0.0.x';
      await buildEtcdClientHandler(async (client) => {
        await client.put(prefix + 'version').value(JSON.stringify(testVersion));
        await sleep(500);
      });

      expect(configService.get('version')).toBe(testVersion);
    })
  );
});
