import { getTestUser } from './example';
import {
  PlayerUser,
  getPlayerUserCacheKey,
} from 'packages/Player/lib/models/user';
import { buildAppContext } from 'test/utils/app';
import _ from 'lodash';
import { generateRandomStr } from 'test/utils/utils';

const context = buildAppContext();

describe('PlayerUser', () => {
  describe('PlayerUser.findByUUID', () => {
    let testUser: PlayerUser;

    beforeAll(async () => {
      testUser = await getTestUser();
    });

    afterEach(async () => {
      await context.app.cache.remove(getPlayerUserCacheKey(testUser.uuid));
    });

    test('PlayerUser.findByUUID should be ok', async () => {
      const player = await PlayerUser.findByUUID(testUser.uuid);
      expect(player.uuid).toBe(testUser.uuid);
    });

    test('PlayerUser.findByUUID should have cache', async () => {
      const testUserUUID = testUser.uuid;

      const user = await PlayerUser.findByUUID(testUserUUID);
      expect(user.uuid).toBe(testUserUUID);

      const cache = await context.app.cache.get(
        getPlayerUserCacheKey(testUserUUID)
      );
      expect(_.get(cache, 'uuid')).toBe(testUserUUID);

      const user2 = await PlayerUser.findByUUID(testUserUUID);
      expect(user2.uuid).toBe(testUserUUID);
    });

    test('PlayerUser.findByUUID should be update cache if modify', async () => {
      const testUserUUID = testUser.uuid;

      const user = await PlayerUser.findByUUID(testUserUUID);
      expect(user.uuid).toBe(testUserUUID);
      expect(user.sign).toBe(testUser.sign);

      const cache = await context.app.cache.get(
        getPlayerUserCacheKey(testUserUUID)
      );
      expect(_.get(cache, 'uuid')).toBe(testUserUUID);
      expect(_.get(cache, 'sign')).toBe(testUser.sign);

      // 修改签名, 应当清空缓存
      const targetSign = generateRandomStr();
      user.sign = targetSign;
      await user.save();

      const cache2 = await context.app.cache.get(
        getPlayerUserCacheKey(testUserUUID)
      );
      expect(cache2).toBeNull();
    });
  });
});
