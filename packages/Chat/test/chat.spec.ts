import { ChatLog as ChatLogCls } from '../lib/models/log';
import { TRPGApplication } from 'trpg/core';
import { ChatMessagePartial } from '../types/message';

const app: TRPGApplication = global.trpgapp;
const db = global.db;
const ChatLog: typeof ChatLogCls = db.models.chat_log;

describe('chat log func', () => {
  const logCacheKey = 'chat:log-cache';
  const testChatLogPayload: ChatMessagePartial = {
    uuid: 'test',
    sender_uuid: 'test',
    to_uuid: 'test',
    message: 'test',
  };

  it('ChatLog.appendCachedChatLog should be ok', async () => {
    await ChatLog.appendCachedChatLog(testChatLogPayload);

    const logList = await app.cache.lget(logCacheKey);
    expect(logList).toHaveProperty('length');
    expect(logList.length).toBeGreaterThan(0);

    await app.cache.lclear(logCacheKey, logList.length - 1, 1); // 清除最后一条
  });

  it('ChatLog.getCachedChatLog should be ok', async () => {
    await trpgapp.cache.rpush('chat:log-cache', testChatLogPayload);

    const logList = await ChatLog.getCachedChatLog();
    expect(logList).toMatchObject([testChatLogPayload]);

    await app.cache.lclear(logCacheKey, logList.length - 1, 1); // 清除最后一条
  });
});
