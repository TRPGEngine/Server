import {
  getTestUser,
  testUserInfo,
  createTestPlayerLoginLog,
  getOtherTestUser,
} from './example';
import {
  PlayerUser,
  getPlayerUserCacheKey,
} from 'packages/Player/lib/models/user';
import { buildAppContext } from 'test/utils/app';
import _ from 'lodash';
import { generateRandomStr } from 'test/utils/utils';
import md5Encrypt from '../lib/utils/md5';
import sha1Encrypt from '../lib/utils/sha1';
import { PlayerLoginLog } from '../lib/models/login-log';
import testExampleStack from 'test/utils/example';
import { PlayerInvite } from '../lib/models/invite';

const context = buildAppContext();

testExampleStack.regAfterAll();

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

  test('user.getFriendList should be ok', async () => {
    const testUser = await getTestUser();
    const otherTestUser = await getOtherTestUser('admin9');
    await testUser.addFriend(otherTestUser); // 确保有一条好友关系

    const list = await testUser.getFriendList();

    expect(list.length).toBeGreaterThan(0);
    expect(list[0]).toHaveProperty('id');
    expect(list[0]).toHaveProperty('username');
  });
});

describe('PlayerLoginLog', () => {
  describe('scope', () => {
    test('default scope', async () => {
      const testPlayerLoginLog = await createTestPlayerLoginLog();

      const row = await PlayerLoginLog.findByPk(testPlayerLoginLog.id);

      expect(row).toHaveProperty('id', testPlayerLoginLog.id);
      expect(row).toHaveProperty('user_uuid');
      expect(row).toHaveProperty('user_name');
      expect(row).toHaveProperty('type');
      expect(row).toHaveProperty('channel');
      expect(row).toHaveProperty('socket_id');
      expect(row).toHaveProperty('ip');
      expect(row).toHaveProperty('ip_address');
      expect(row).toHaveProperty('platform');
      expect(row).toHaveProperty('device_info');
      expect(row).toHaveProperty('is_success');
      expect(row).toHaveProperty('token');
      expect(row).toHaveProperty('offline_date');
      expect(row).toHaveProperty('createdAt');
      expect(row).toHaveProperty('updatedAt');
    });

    test('public scope', async () => {
      const testPlayerLoginLog = await createTestPlayerLoginLog();

      const row = await PlayerLoginLog.scope('public').findByPk(
        testPlayerLoginLog.id
      );

      expect(row).toHaveProperty('id', testPlayerLoginLog.id);
      expect(row.socket_id).toBeFalsy();
      expect(row.ip).toBeFalsy();
      expect(row.token).toBeFalsy();
    });
  });

  test('getPlayerLoginLog', async () => {
    const testUser = await getTestUser();
    const logs = await PlayerLoginLog.getPlayerLoginLog(testUser.uuid);

    expect(logs.length).toBeLessThanOrEqual(10);
    expect(_.get(logs, '0.socket_id')).toBeFalsy();
    expect(_.get(logs, '0.ip')).toBeFalsy();
    expect(_.get(logs, '0.token')).toBeFalsy();
  });

  test('requestIpInfo', async () => {
    const location = await PlayerLoginLog.requestIpLocation('127.0.0.1');
    expect(location).toBe('本机地址');
    const location2 = await PlayerLoginLog.requestIpLocation('114.114.114.114');
    expect(location2).toBe('江苏省南京市 电信');
  });
});

describe('PlayerInvite', () => {
  test('sendFriendInvite should be ok', async () => {
    const testUser = await getTestUser();
    const testUser9 = await getOtherTestUser('admin9');
    const invite = await PlayerInvite.sendFriendInvite(
      testUser.uuid,
      testUser9.uuid
    );

    try {
      expect(invite.from_uuid).toBe(testUser.uuid);
      expect(invite.to_uuid).toBe(testUser9.uuid);
      expect(invite.is_agree).toBe(false);
      expect(invite.is_refuse).toBe(false);

      const inviteId = invite.id;
      const inviteIns: PlayerInvite = await PlayerInvite.findByPk(inviteId);

      expect(inviteIns.uuid).toBe(invite.uuid);
    } finally {
      await invite.destroy();
    }
  });
});
