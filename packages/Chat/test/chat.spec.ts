import { ChatLog } from '../lib/models/log';
import { ChatMessagePartial } from '../types/message';
import { buildAppContext } from 'test/utils/app';
import { createTestChatlog, createTestChatlogPayload } from './example';
import { getTestUser } from 'packages/Player/test/example';
import testExampleStack from 'test/utils/example';
import _ from 'lodash';

const context = buildAppContext();

testExampleStack.regAfterAll();

describe('chat log func', () => {
  const logCacheKey = 'chat:log-cache';
  const testChatLogPayload: ChatMessagePartial = {
    uuid: 'test',
    sender_uuid: 'test',
    to_uuid: 'test',
    message: 'test',
  };

  test('ChatLog.appendCachedChatLog should be ok', async () => {
    await ChatLog.appendCachedChatLog(testChatLogPayload);

    const logList = await context.app.cache.lget(logCacheKey);
    expect(logList).toHaveProperty('length');
    expect(logList.length).toBeGreaterThan(0);

    await context.app.cache.lclear(logCacheKey, logList.length - 1, 1); // 清除最后一条
  });

  test('ChatLog.getCachedChatLog should be ok', async () => {
    await context.app.cache.rpush('chat:log-cache', testChatLogPayload);

    const logList = await ChatLog.getCachedChatLog();
    expect(logList).toMatchObject([testChatLogPayload]);

    await context.app.cache.lclear(logCacheKey, logList.length - 1, 1); // 清除最后一条
  });

  test('ChatLog.dumpCachedChatLog should be ok', async () => {
    await context.app.cache.rpush('chat:log-cache', testChatLogPayload);
    const mockBulkCreate = jest.fn();
    ChatLog.bulkCreate = mockBulkCreate;

    await ChatLog.dumpCachedChatLog();

    expect(mockBulkCreate).toBeCalledTimes(1);
    expect(mockBulkCreate.mock.calls[0][0]).toMatchObject([testChatLogPayload]);

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
