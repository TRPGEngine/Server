import { ChatLog } from '../lib/models/log';
import { ChatMessagePartial } from '../types/message';
import { buildAppContext } from 'test/utils/app';

const context = buildAppContext();

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
});
