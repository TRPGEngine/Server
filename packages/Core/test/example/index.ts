import { ICache } from 'packages/Core/lib/cache';
import { generateRandomStr } from 'test/utils/utils';

/**
 * 往缓存中写入测试数据
 * 测试数据60秒后过期
 */
export async function writeTestCache(cache: ICache, num: number) {
  for (let i = 0; i < num; i++) {
    const randomStr = generateRandomStr();
    await cache.set(`test:${randomStr}`, randomStr, {
      expires: 60 * 1000,
    });
  }
}
