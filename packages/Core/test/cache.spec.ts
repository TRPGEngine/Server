import { RedisCache, ICache, Cache } from '../lib/cache';
import Config from 'config';

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
