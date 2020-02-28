import { ChatLog } from '../lib/models/log';
import { ChatMessagePartial } from '../types/message';
import { buildAppContext } from 'test/utils/app';
import { createTestChatlog, createTestChatlogPayload } from './example';
import {
  getTestUser,
  handleLogin,
  handleLogout,
} from 'packages/Player/test/example';
import testExampleStack from 'test/utils/example';
import _ from 'lodash';
import { PlayerUser } from 'packages/Player/lib/models/user';

const context = buildAppContext();

testExampleStack.regAfterAll();

describe('chat log func', () => {
  const logCacheKey = ChatLog.CACHE_KEY;
  const testChatLogPayload: ChatMessagePartial = {
    uuid: 'test',
    sender_uuid: 'test',
    to_uuid: 'test',
    message: 'test',
  };

  let testUser: PlayerUser;
  beforeAll(async () => {
    testUser = await handleLogin(context);
  });

  afterAll(async () => {
    await handleLogout(context, testUser);
  });

  afterEach(async () => {
    // 清理chat log cache
    await context.app.cache.lclear(logCacheKey, 0, -1); // 清除所有缓存
  });

  describe('ChatLog.appendCachedChatLog should be ok', () => {
    test('normal msg should be ok', async () => {
      ChatLog.appendCachedChatLog(testChatLogPayload);

      const logList = await context.app.cache.lget(logCacheKey);
      expect(logList).toHaveProperty('length');
      expect(logList.length).toBeGreaterThan(0);
    });

    test('should be process emoji', async () => {
      const payload = ChatLog.appendCachedChatLog({
        ...testChatLogPayload,
        message: '🐱', // This evil make me lost 10 minutes chat log
      });

      expect(payload.message).toBe(':cat:');
    });

    test('should change msg type if user send blacklist type', async () => {
      const payload = ChatLog.appendCachedChatLog({
        ...testChatLogPayload,
        sender_uuid: '857b3f0a-a777-11e5-bf7f-feff819cdc9f',
        type: 'tip',
      });

      expect(payload.type).toBe('tip'); // 通过系统内部发送应为tip

      const ret = await context.emitEvent('chat::message', {
        ...testChatLogPayload,
        sender_uuid: '857b3f0a-a777-11e5-bf7f-feff819cdc9f',
        type: 'tip',
      });
      expect(ret.result).toBe(true);
      expect(ret.pkg.type).toBe('normal'); // 通过event发送的消息类型应变为normal
    });

    test('should not change msg type if system send blacklist type', () => {
      const payload = ChatLog.appendCachedChatLog({
        ...testChatLogPayload,
        sender_uuid: 'trpgsystem',
        type: 'tip',
      });

      expect(payload.type).toBe('tip');
    });
  });

  test('ChatLog.getCachedChatLog should be ok', async () => {
    await context.app.cache.rpush('chat:log-cache', testChatLogPayload);

    const logList = await ChatLog.getCachedChatLog();
    expect(logList.length).toBeGreaterThan(0);
    expect(
      _.findIndex(logList, (x) => _.isEqual(x, testChatLogPayload))
    ).toBeGreaterThanOrEqual(0);

    await context.app.cache.lclear(logCacheKey, logList.length - 1, 1); // 清除最后一条
  });

  test('ChatLog.dumpCachedChatLog should be ok', async () => {
    await context.app.cache.rpush('chat:log-cache', testChatLogPayload);
    const mockBulkCreate = jest.fn();
    ChatLog.bulkCreate = mockBulkCreate;

    await ChatLog.dumpCachedChatLog();

    expect(mockBulkCreate).toBeCalledTimes(1);
    const callArg = mockBulkCreate.mock.calls[0][0];
    expect(_.isArray(callArg)).toBe(true);
    expect(callArg.length).toBeGreaterThan(0);
    expect(
      _.findIndex(callArg, (x) => _.isEqual(x, testChatLogPayload))
    ).toBeGreaterThanOrEqual(0);

    expect(await context.app.cache.lget(ChatLog.CACHE_KEY)).toMatchObject([]);
  });

  test.todo('ChatLog.sendMsg should be ok');

  test.todo('ChatLog.sendSystemMsg should be ok');

  test.todo('ChatLog.sendSimpleSystemMsg should be ok');

  describe('ChatLog.revokeMsg should be ok', () => {
    test('revoke when chatlog in DB', async () => {
      const testUser = await getTestUser();
      const testChatlog = await createTestChatlog();
      await ChatLog.revokeMsg(testChatlog.uuid, testUser.uuid);

      expect(testChatlog.revoke).toBe(false);

      const ret = await ChatLog.findOne({
        where: {
          uuid: testChatlog.uuid,
        },
      });

      expect(ret.revoke).toBe(true);
    });

    test('revoke when chatlog in Cache', async () => {
      const testUser = await getTestUser();
      const testChatlogPayload = await createTestChatlogPayload();
      await context.app.cache.rpush(ChatLog.CACHE_KEY, testChatlogPayload);

      await ChatLog.revokeMsg(testChatlogPayload.uuid, testUser.uuid);

      const cacheList = await context.app.cache.lget(ChatLog.CACHE_KEY);
      const ret = cacheList.find(
        (item) => _.get(item, 'uuid') === testChatlogPayload.uuid
      );
      expect(_.get(ret, 'revoke')).toBe(true);

      context.app.cache.lclear(ChatLog.CACHE_KEY, 0, cacheList.length);
    });
  });
});
