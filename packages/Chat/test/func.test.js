const app = global.trpgapp;
const db = global.db;

describe('register', () => {
  test('app.player should be exist', () => {
    expect(app.player).toBeTruthy();
  });

  test('app.chat should be exist', () => {
    expect(app.chat).toBeTruthy();
  });

  test('chat models should be exist', () => {
    expect(db.models.chat_log).toBeTruthy();
    expect(db.models.chat_converse).toBeTruthy();
  })
})

describe('actions', () => {
  let senderUser = null;

  beforeAll(async () => {
    senderUser = await db.models.player_user.findOne({
      where: {
        username: 'admin1'
      }
    })
    expect(senderUser).toBeTruthy();
  })

  afterAll(() => {
    senderUser = null
  })

  test.todo('addConverse should be ok');

  describe('msg action', () => {
    beforeEach(async () => {
      this.testMsg = await db.models.chat_log.create({
        sender_uuid: senderUser.uuid,
        message: 'test message',
        date: new Date()
      })
    })

    afterEach(async () => {
      await this.testMsg.destroy();
    })

    test('findMsgAsync should be ok', async () => {
      let msg = this.testMsg;

      let found = await app.chat.findMsgAsync(msg.uuid);
      expect(found).toBeTruthy();
      expect(found.uuid).toBe(msg.uuid);
      expect(found.message).toBe(msg.message);
    })
  })

  test.todo('updateMsgAsync should be ok');

  test.todo('sendMsg should be ok');

  test.todo('sendSystemMsg should be ok');

  test.todo('sendSystemSimpleMsg should be ok');

  test.todo('saveChatLogAsync should be ok');

  test('getChatLogSumAsync should be ok', async () => {
    let count = await app.chat.getChatLogSumAsync();
    expect(count).toEqual(expect.any(Number))
  })

  test('getChatLogAsync should be ok', async () => {
    let logList = await app.chat.getChatLogAsync();
    expect(logList).toBeTruthy();
    expect(logList.length).toBeGreaterThanOrEqual(0);
  })

  test.todo('notifyUpdateMsg should be ok');
})
