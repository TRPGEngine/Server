import { buildAppContext } from 'test/utils/app';
import { regAutoClear } from 'test/utils/example';
import { createTestBotApp } from './example';

const context = buildAppContext();
regAutoClear();

describe('bot app', () => {
  test('appLogin', async () => {
    const testBotApp = await createTestBotApp();
    const ret = await context.emitEvent('bot::appLogin', {
      appKey: testBotApp.key,
      appSecret: testBotApp.secret,
    });

    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('bot');
    expect(ret).toHaveProperty('user');
    expect(ret.bot.uuid).toBe(testBotApp.uuid);
  });
});
