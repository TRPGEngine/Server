import { getTestUser, testUserInfo } from './example';
import {
  PlayerUser,
  getPlayerUserCacheKey,
} from 'packages/Player/lib/models/user';
import { buildAppContext } from 'test/utils/app';
import _ from 'lodash';
import { generateRandomStr } from 'test/utils/utils';
import md5Encrypt from '../lib/utils/md5';
import sha1Encrypt from '../lib/utils/sha1';

const context = buildAppContext();

describe('PlayerUser', () => {
  describe('PlayerUser.findByUUID', () => {
    let testUser: PlayerUser;

    beforeAll(async () => {
      testUser = await getTestUser();
    });

    beforeEach(async () => {
      await context.app.cache.remove(getPlayerUserCacheKey(testUser.uuid));
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

  describe('PlayerUser.findByUsernameAndPassword', () => {
    test('PlayerUser.findByUsernameAndPassword should get token, app_token, salt', async () => {
      const user = await PlayerUser.findByUsernameAndPassword(
        testUserInfo.username,
        testUserInfo.password
      );

      expect(user).toHaveProperty('token');
      expect(user).toHaveProperty('app_token');
      expect(user).toHaveProperty('salt');
    });
  });

  describe('PlayerUser.registerUser', () => {
    // 存储密码
    const clientTransPassword = md5Encrypt(generateRandomStr(20));

    test('should be ok', async () => {
      const username = generateRandomStr(16);
      const newUser = await PlayerUser.registerUser(
        username,
        clientTransPassword
      );

      try {
        expect(newUser.username).toBe(username);
        expect(newUser.salt).toBeTruthy();
        expect(newUser.password).toBe(
          sha1Encrypt(md5Encrypt(clientTransPassword) + newUser.salt)
        );
      } finally {
        await newUser.destroy({ force: true });
      }
    });

    test('should throw error in lone username', async () => {
      await expect(
        (async () => {
          await PlayerUser.registerUser(
            generateRandomStr(25),
            clientTransPassword
          );
        })()
      ).rejects.toThrowError('注册失败!用户名过长');
    });

    test('should throw error if user exist', async () => {
      const username = generateRandomStr(16);
      const newUser = await PlayerUser.registerUser(
        username,
        clientTransPassword
      );

      try {
        await expect(
          PlayerUser.registerUser(username, clientTransPassword)
        ).rejects.toThrowError('用户名已存在');
      } finally {
        await newUser.destroy({ force: true });
      }
    });
  });
});
