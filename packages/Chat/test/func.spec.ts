import { buildAppContext } from 'test/utils/app';
import { ChatLog } from '../lib/models/log';
import { PlayerUser } from 'packages/Player/lib/models/user';

const context = buildAppContext();

describe('register', () => {
  test('context.app.player should be exist', () => {
    expect(context.app.player).toBeTruthy();
  });

  test('context.app.chat should be exist', () => {
    expect(context.app.chat).toBeTruthy();
  });

  test('chat models should be exist', () => {
    const db = context.db;
    expect(db.models.chat_log).toBeTruthy();
    expect(db.models.chat_converse).toBeTruthy();
  });
});

describe('actions', () => {
  let senderUser = null;

  beforeAll(async () => {
    senderUser = await PlayerUser.findOne({
      where: {
        username: 'admin1',
      },
    });
    expect(senderUser).toBeTruthy();
  });

  afterAll(() => {
    senderUser = null;
  });

  test.todo('addConverse should be ok');

  describe('msg action', () => {
    let testMsg: ChatLog = null;
    beforeEach(async () => {
      testMsg = await ChatLog.create({
        sender_uuid: senderUser.uuid,
        message: 'test message',
        date: new Date(),
      });
    });

    afterEach(async () => {
      await testMsg.destroy();
    });

    test('findMsgAsync should be ok', async () => {
      const msg = testMsg;

      const found = await context.app.chat.findMsgAsync(msg.uuid);
      expect(found).toBeTruthy();
      expect(found.uuid).toBe(msg.uuid);
      expect(found.message).toBe(msg.message);
    });
  });

  test.todo('updateMsgAsync should be ok');

  test.todo('sendMsg should be ok');

  test.todo('sendSystemMsg should be ok');

  test.todo('sendSystemSimpleMsg should be ok');

  test.todo('saveChatLogAsync should be ok');

  test('getChatLogSumAsync should be ok', async () => {
    let count = await context.app.chat.getChatLogSumAsync();
    expect(count).toEqual(expect.any(Number));
  });

  test('getChatLogAsync should be ok', async () => {
    let logList = await context.app.chat.getChatLogAsync();
    expect(logList).toBeTruthy();
    expect(logList.length).toBeGreaterThanOrEqual(0);
  });

  test.todo('notifyUpdateMsg should be ok');
});
