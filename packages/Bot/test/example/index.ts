import { BotApp } from 'packages/Bot/lib/models/app';
import { BotMsgToken } from 'packages/Bot/lib/models/msg-token';
import { GroupGroup } from 'packages/Group/lib/models/group';
import { getTestUser } from 'packages/Player/test/example';
import testExampleStack from 'test/utils/example';
import { generateRandomStr } from 'test/utils/utils';

/**
 * 创建一个测试机器人应用
 */
export async function createTestBotApp(): Promise<BotApp> {
  const testUser = await getTestUser();
  const name = generateRandomStr();
  const bot = await BotApp.createBotApp(testUser.uuid, '127.0.0.1', name);

  testExampleStack.append(bot);

  return bot;
}

/**
 * 创建一个测试的简易消息机器人
 * @param groupId 团ID
 */
export async function createTestBotMsgToken(groupId: number) {
  const testUser = await getTestUser();
  const group = await GroupGroup.findByPk(groupId);
  const bot = await BotMsgToken.createMsgToken(
    generateRandomStr(),
    group.uuid,
    null,
    testUser.uuid
  );

  testExampleStack.append(bot);

  return bot;
}
