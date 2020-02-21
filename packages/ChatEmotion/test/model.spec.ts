import { buildAppContext } from 'test/utils/app';
import { getTestUser, getOtherTestUser } from 'packages/Player/test/example';
import {
  ChatEmotionCatalog,
  getUserEmotionCatalogCacheKey,
} from '../lib/models/catalog';
import { createTestChatEmotionCatalog } from './example';

const context = buildAppContext();

describe('ChatEmotionCatalog', () => {
  test('ChatEmotionCatalog.getUserEmotionCatalogByUUID should be ok', async () => {
    const testUser = await getTestUser();
    const catalogs = await ChatEmotionCatalog.getUserEmotionCatalogByUUID(
      testUser.uuid
    );

    expect(Array.isArray(catalogs)).toBe(true);
    if (catalogs.length > 0) {
      expect(catalogs[0]).toHaveProperty('items');
    }

    // 检测缓存是否存在且相同
    const cache = await context.app.cache.get(
      getUserEmotionCatalogCacheKey(testUser.uuid)
    );
    expect(cache).not.toBeNull();
    expect(Array.isArray(cache)).toBe(true);

    // 比较时忽略chat_emotion_usermap_catalog属性
    expect(
      (cache as any).map((c) => ({
        ...c,
        chat_emotion_usermap_catalog: undefined,
      }))
    ).toMatchObject(
      catalogs.map((catalog) => ({
        ...catalog.toJSON(),
        chat_emotion_usermap_catalog: undefined,
      }))
    );
  });

  test('ChatEmotionCatalog.addUserEmotionCatalog should be ok', async () => {
    // 使用其他的测试用户防止redis缓存检测与上面的冲突
    const testUser = await getOtherTestUser('admin9');
    const testCatalog = await createTestChatEmotionCatalog();
    const cacheKey = getUserEmotionCatalogCacheKey(testUser.uuid);

    await context.app.cache.set(cacheKey, 'any test string'); // 假装之前有缓存

    await ChatEmotionCatalog.addUserEmotionCatalog(testUser.uuid, testCatalog);

    const catalogs = await testUser.getEmotionCatalogs();
    // 检测数据已被写入
    expect(Array.isArray(catalogs)).toBe(true);
    expect(catalogs.length).toBeGreaterThan(0);
    expect(catalogs.map((c) => c.id).includes(testCatalog.id)).toBe(true);

    // 检测缓存已被清理
    const cache = await context.app.cache.get(cacheKey);
    expect(cache).toBe(null);

    // 移除示例的表情包
    await testUser.removeEmotionCatalog(testCatalog);
  });
});
