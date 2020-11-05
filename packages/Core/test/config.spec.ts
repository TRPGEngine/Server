import { Etcd3Config } from '../lib/config';

// 尚未实装
describe.skip('Etcd3Config', () => {
  test('checkAndApplyDefault should be ok', async () => {
    const config = new Etcd3Config();

    // 只要没有报错就算成功
    const count = await config.checkAndApplyDefault(require('config'));

    expect(count).toBeGreaterThan(0);
  });
});
