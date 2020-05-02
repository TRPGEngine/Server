import { RedisCache, ICache, Cache } from '../lib/cache';
import Config from 'config';
import { writeTestCache } from './example';

const redisUrl = Config.get<string>('redisUrl');
const isRedis = !!redisUrl;

describe('cache', () => {
  let cache: ICache;
  beforeAll(() => {
    cache = isRedis
      ? new RedisCache({
          url: redisUrl,
        })
      : new Cache();
  });

  afterAll(() => {
    cache.close();
  });

  describe(isRedis ? 'redis cache' : 'memory cache', () => {
    describe('cache keys', () => {
      if (!isRedis) {
        console.warn('this test case require redis url');
        return;
      }

      it('scan', async () => {
        await writeTestCache(cache, 20); // 写入一些测试数据保证redis中有数据可以测试

        const redis = (cache as RedisCache).redis;
        const [keys1, keys2] = await Promise.all([
          redis.keys('trpg:*'),
          cache.keys('*'),
        ]);

        expect(
          keys1.sort().map((s) => {
            // 移除前面的 trpg: 前缀
            return s.substr('trpg:'.length);
          })
        ).toMatchObject(keys2.sort()); // 排序后再比较。因为使用scan出来的字段可能有空
      });
    });

    describe('cache lock', () => {
      if (!isRedis) {
        console.warn('this test case require redis url');
        return;
      }

      it('lock', async () => {
        const key = 'test-lock';
        expect(await cache.lock(key)).toBe(true);
        expect(await cache.lock(key)).toBe(false);
      });

      it('unlock', async () => {
        const key = 'test-lock2';
        expect(await cache.lock(key)).toBe(true);
        expect(await cache.lock(key)).toBe(false);
        await cache.unlock(key);
        expect(await cache.lock(key)).toBe(true);
      });
    });
  });
});
