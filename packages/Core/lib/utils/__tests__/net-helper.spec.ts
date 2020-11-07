import { checkDBLink, checkRedisLink, portAvailableCheck } from '../net-helper';
import config from 'config';
import _ from 'lodash';
import url from 'url';

describe('net-helper', () => {
  describe('portAvailableCheck', () => {
    test('check db', async () => {
      const host = _.get(config, 'db.options.host', 'localhost');
      const port = _.get(config, 'db.options.port', 3306);

      await portAvailableCheck(host, port);
    });

    test('check redis', async () => {
      const redisUrl = _.get(config, 'redisUrl', '');
      const info = url.parse(redisUrl);
      await portAvailableCheck(info.hostname, Number(info.port));
    });
  });

  test('checkDBLink', async () => {
    await checkDBLink();
  });

  test('checkRedisLink', async () => {
    await checkRedisLink();
  });
});
