import testExampleStack from 'test/utils/example';
import { ChatEmotionCatalog } from 'packages/ChatEmotion/lib/models/catalog';
import { generateRandomStr } from 'test/utils/utils';

/**
 * 创建一个测试消息
 */
export const createTestChatEmotionCatalog = async (): Promise<ChatEmotionCatalog> => {
  const testChatEmotionCatalog = await ChatEmotionCatalog.create({
    name: generateRandomStr(10),
  });

  testExampleStack.append(testChatEmotionCatalog);

  return testChatEmotionCatalog;
};
