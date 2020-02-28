import { buildFindByUUIDCache } from '../lib/utils/decorator';
import { buildAppContext } from 'test/utils/app';
import { Model } from 'trpg/core';

const context = buildAppContext();

describe('utils test', () => {
  describe('decorator', () => {
    test('buildFindByUUIDCache', async () => {
      const hashFn = (uuid) => `test:${uuid}`;
      const testUUID = 'any uuid';
      const cacheKey = hashFn(testUUID);
      await context.app.cache.remove(cacheKey); // 进入前先清理缓存
      const mockRet = { info: 'any' }; // 模拟返回值

      class Foo extends Model {
        info: string;

        @buildFindByUUIDCache(hashFn)
        static async findByUUID(uuid: string) {
          return mockRet;
        }
      }
      Foo.init(
        {
          info: { type: context.app.storage._Sequelize.STRING },
        },
        { tableName: 'test', sequelize: context.app.storage.db }
      );

      const ret = await Foo.findByUUID(testUUID);
      const cache = await context.app.cache.get(cacheKey);

      try {
        expect(ret).toMatchObject({ info: 'any' });
        expect(cache).toMatchObject({ info: 'any' });

        mockRet.info = 'other';
        // 依旧使用缓存
        expect(await Foo.findByUUID(testUUID)).toMatchObject({ info: 'any' });
      } finally {
        await context.app.cache.remove(cacheKey);
      }
    });
  });
});
