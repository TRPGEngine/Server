const event = require('../lib/event');
const db = global.db;
const testEvent = global.testEvent;
const emitEvent = global.emitEvent;
const socket = global.socket;

let listenedEvent = {};

function registerSocketListener(eventName, cb) {
  if(listenedEvent[eventName]) {
    // 加入事件列表
    listenedEvent[eventName].push(cb)
  }else{
    listenedEvent[eventName] = [cb];
    socket.on(eventName, (data) => {
      // 循环调用所有注册的事件回调
      if(listenedEvent[eventName]) {
        // 如果有该事件存在
        for (const fn of listenedEvent[eventName]) {
          fn(data);
        }
      }
    })
  }
}

describe('message action', () => {
  beforeAll(() => {
    this.shouldTriggerOnce = (eventName) => {
      return new Promise((resolve) => {
        registerSocketListener(eventName, (data) => {
          resolve(data);
        })
      })
    }
  })

  test.todo('message should be ok');
})

describe('chat event action', () => {
  let userInfo = {};
  let userInfoDbInstance = null;

  beforeAll(async () => {
    const loginInfo = await emitEvent('player::login', {
      username: 'admin1',
      password: '21232f297a57a5a743894a0e4a801fc3'
    })
    expect(loginInfo.result).toBe(true);
    userInfo = loginInfo.info

    userInfoDbInstance = await db.models.player_user.findOne({
      where: {uuid: userInfo.uuid}
    })
  })

  afterAll(async () => {
    await emitEvent('player::logout', {
      uuid: userInfo.uuid,
      token: userInfo.token
    })

    userInfo = {};
    userInfoDbInstance = null;
  })

  describe('converse action', () => {
    beforeEach(async () => {
      this.converse = await db.models.chat_converse.create({
        name: 'test_converse',
      })
      await this.converse.setOwner(userInfoDbInstance);
    })

    afterEach(async () => {
      if(this.converse) {
        await this.converse.destroy();
      }
    })

    test('getConverses should be ok', async () => {
      let ret = await emitEvent('chat::getConverses');
      expect(ret.result).toBe(true);
      expect(Array.isArray(ret.list)).toBe(true);
    });

    test('removeConverse should be ok', async () => {
      let ret = await emitEvent('chat::removeConverse', {
        converseUUID: this.converse.uuid
      });
      expect(ret.result).toBe(true);

      this.converse = null; // 手动清空
    })
  })

  describe('message action', async () => {
    const targetConverse = 'test-trpg-converse-' + Math.random();
    const targetUUID = 'test-trpg-uuid-' + Math.random();

    beforeEach(async () => {
      this.testChatLog = await db.models.chat_log.create({
        sender_uuid: userInfo.uuid,
        to_uuid: targetUUID,
        message: 'test message',
        type: 'normal',
        date: new Date(),
      })
      this.testChatConverseLog = await db.models.chat_log.create({
        sender_uuid: userInfo.uuid,
        converse_uuid: targetConverse,
        message: 'test converse message',
        type: 'normal',
        date: new Date(),
      })
    })

    afterEach(async () => {
      await this.testChatLog.destroy();
      await this.testChatConverseLog.destroy();
    })

    test('getUserChatLog should be ok', async () => {
      let ret = await emitEvent('chat::getUserChatLog', {user_uuid: targetUUID});

      expect(ret.result).toBe(true);
      expect(Array.isArray(ret.list)).toBe(true);
      expect(ret.list).toMatchObject([{
        uuid: this.testChatLog.uuid,
        sender_uuid: userInfo.uuid,
        to_uuid: targetUUID
      }])
    })

    test('getConverseChatLog should be ok', async () => {
      let ret = await emitEvent('chat::getConverseChatLog', {converse_uuid: targetConverse});

      expect(ret.result).toBe(true);
      expect(ret).toHaveProperty('list');
      expect(Array.isArray(ret.list)).toBe(true);
      expect(ret.list).toMatchObject([{
        uuid: this.testChatConverseLog.uuid,
        sender_uuid: userInfo.uuid,
        converse_uuid: targetConverse
      }])
    })

    test('getAllUserConverse should be ok', async () => {
      let ret = await emitEvent('chat::getAllUserConverse');
      expect(ret.result).toBe(true);
      expect(ret).toHaveProperty('senders');
      expect(Array.isArray(ret.senders)).toBe(true);
      expect(ret.senders).toEqual(expect.arrayContaining([targetUUID]))
    })

    test('getOfflineUserConverse should be ok', async () => {
      const now = new Date();
      const lastLoginDate = new Date(now.setDate(now.getDate() - 10));
      // 获取一天前到现在的所有会话
      let ret = await emitEvent('chat::getOfflineUserConverse', {lastLoginDate});
      expect(ret.result).toBe(true);
      expect(ret).toHaveProperty('senders');
      expect(Array.isArray(ret.senders)).toBe(true);
      expect(ret.senders).toEqual(expect.arrayContaining([targetUUID]))
    })
  })

  test('updateCardChatData should be ok', async () => {
    const testChat = await db.models.chat_log.create({
      type: 'card',
      sender_uuid: userInfo.uuid,
      to_uuid: 'any user',
      data: {number: 1, string: "2"}
    })
    expect(testChat).toBeTruthy();
    expect(testChat.data).toMatchObject({number: 1, string: "2"})

    let ret = await emitEvent('chat::updateCardChatData', {
      chatUUID: testChat.uuid,
      newData: {number: 3, array: ['1', '2']}
    })
    expect(ret.result).toBe(true);
    expect(ret.log.data).toMatchObject({number: 3, array: ['1', '2'], string: "2"})

    await testChat.destroy();
  })
})
