import { ChatLog } from 'packages/Chat/lib/models/log';
import uuid from 'uuid/v4';
import { getTestUser } from 'packages/Player/test/example';
import testExampleStack from 'test/utils/example';
import { ChatMessagePartial } from 'packages/Chat/types/message';

export const createTestChatlogPayload = async (
  payload?: ChatMessagePartial
): Promise<ChatMessagePartial> => {
  const testUser = await getTestUser();
  return {
    uuid: uuid(),
    sender_uuid: testUser.uuid,
    message: 'Test Message',
    date: new Date().toISOString(),
    ...payload,
  };
};

/**
 * 创建一个测试消息
 */
export const createTestChatlog = async (
  payload?: ChatMessagePartial
): Promise<ChatLog> => {
  const chatlogPayload = await createTestChatlogPayload(payload);
  const testChatlog = await ChatLog.create(chatlogPayload);

  testExampleStack.append(testChatlog);

  return testChatlog;
};
