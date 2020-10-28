import { createTestGroup } from 'packages/Group/test/example';
import { getTestUser } from 'packages/Player/test/example';
import { buildAppContext } from 'test/utils/app';
import { regAutoClear } from 'test/utils/example';
import { BotApp } from '../lib/models/app';
import { BotMsgToken } from '../lib/models/msg-token';
import { createTestBotApp, createTestBotMsgToken } from './example';

const context = buildAppContext();
regAutoClear();

describe('BotApp', () => {
  test('BotApp.findAppUser should be ok', async () => {
    const testUser = await getTestUser();
    const testBotApp = await createTestBotApp();

    const { user, bot } = await BotApp.findAppUser(
      testBotApp.key,
      testBotApp.secret
    );

    expect(user.id).toBe(testBotApp.userId);
    expect(testUser.id).toBe(testBotApp.ownerId);
    expect(bot.uuid).toBe(testBotApp.uuid);
  });
});

describe('BotMsgToken', () => {
  test('BotMsgToken.createMsgToken should be ok', async () => {
    const testUser = await getTestUser();
    const testGroup = await createTestGroup();

    const bot = await BotMsgToken.createMsgToken(
      'test bot token',
      testGroup.uuid,
      null,
      testUser.uuid
    );

    try {
      expect(typeof bot.uuid).toBe('string');
      expect(typeof bot.token).toBe('string');
      expect(bot.uuid).not.toBe(bot.token);
      expect(bot.name).toBe('test bot token');
      expect(bot.group_uuid).toBe(testGroup.uuid);
      expect(bot.channel_uuid).toBeNull();
    } finally {
      bot.destroy({ force: true });
    }
  });

  test('BotMsgToken.createMsgToken should be ok', async () => {
    const testUser = await getTestUser();
    const testGroup = await createTestGroup();

    const bot = await createTestBotMsgToken(testGroup.id);

    await BotMsgToken.removeMsgToken(testGroup.uuid, bot.uuid, testUser.uuid);

    expect(await BotMsgToken.findByUUID(bot.uuid)).toBeNull();
  });

  test('BotMsgToken.getMsgTokenList should be ok', async () => {
    const testUser = await getTestUser();
    const testGroup = await createTestGroup();

    await createTestBotMsgToken(testGroup.id);
    await createTestBotMsgToken(testGroup.id);

    const list = await BotMsgToken.getMsgTokenList(
      testGroup.uuid,
      testUser.uuid
    );

    expect(list.length).toBe(2);
  });
});
