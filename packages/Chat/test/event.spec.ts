import { buildAppContext } from 'test/utils/app';
import { PlayerUser } from 'packages/Player/lib/models/user';
import { ChatConverse } from '../lib/models/converse';
import { ChatLog } from '../lib/models/log';
import { handleLogin } from 'packages/Player/test/example';

const context = buildAppContext();

let listenedEvent = {};

// function registerSocketListener(eventName, cb) {
//   if (listenedEvent[eventName]) {
//     // 加入事件列表
//     listenedEvent[eventName].push(cb);
//   } else {
//     listenedEvent[eventName] = [cb];
//     context.socket.on(eventName, (data) => {
//       // 循环调用所有注册的事件回调
//       if (listenedEvent[eventName]) {
//         // 如果有该事件存在
//         for (const fn of listenedEvent[eventName]) {
//           fn(data);
//         }
//       }
//     });
//   }
// }

// describe('message action', () => {
// beforeAll(() => {
//   this.shouldTriggerOnce = (eventName) => {
//     return new Promise((resolve) => {
//       registerSocketListener(eventName, (data) => {
//         resolve(data);
//       });
//     });
//   };
// });
// });

describe('chat event action', () => {
  let userInfo: any = {};
  let userInfoDbInstance = null;

  beforeAll(async () => {
    const loginInfo = await handleLogin(context);
    userInfo = loginInfo;

    userInfoDbInstance = await PlayerUser.findOne({
      where: { uuid: userInfo.uuid },
    });
  });

  afterAll(async () => {
    await context.emitEvent('player::logout', {
      uuid: userInfo.uuid,
      token: userInfo.token,
    });

    userInfo = {};
    userInfoDbInstance = null;
  });

  describe('converse action', () => {
    let testConverse: ChatConverse = null;
    beforeEach(async () => {
      testConverse = await ChatConverse.create({
        name: 'test_converse',
      });
      await testConverse.setOwner(userInfoDbInstance);
    });

    afterEach(async () => {
      if (testConverse) {
        await testConverse.destroy();
        testConverse = null;
      }
    });

    test('getConverses should be ok', async () => {
      let ret = await context.emitEvent('chat::getConverses');
      expect(ret.result).toBe(true);
      expect(Array.isArray(ret.list)).toBe(true);
    });

    test('removeConverse should be ok', async () => {
      let ret = await context.emitEvent('chat::removeConverse', {
        converseUUID: testConverse.uuid,
      });
      expect(ret.result).toBe(true);
    });
  });

  describe('message action', () => {
    const targetConverse = 'test-trpg-converse-' + Math.random();
    const targetUUID = 'test-trpg-uuid-' + Math.random();
    let testChatLog: ChatLog = null;
    let testChatConverseLog: ChatLog = null;

    beforeEach(async () => {
      testChatLog = await ChatLog.create({
        sender_uuid: userInfo.uuid,
        to_uuid: targetUUID,
        message: 'test message',
        type: 'normal',
        date: new Date(),
      });
      testChatConverseLog = await ChatLog.create({
        sender_uuid: userInfo.uuid,
        converse_uuid: targetConverse,
        message: 'test converse message',
        type: 'normal',
        date: new Date(),
      });
    });

    afterEach(async () => {
      await testChatLog.destroy();
      await testChatConverseLog.destroy();
    });

    test('message should be ok', async () => {
      const message = 'any text';
      const to_uuid = 'test1';
      const ret = await context.emitEvent('chat::message', {
        sender_uuid: 'any',
        to_uuid,
        message,
      });

      expect(ret).toBeSuccess();
      expect(ret).toHaveProperty('pkg');
      expect(ret.pkg.sender_uuid).toBe(userInfo.uuid); // 返回的消息的发送消息不会被请求的消息伪造
      expect(ret.pkg.to_uuid).toBe(to_uuid);
      expect(ret.pkg.message).toBe(message);
      // ------- 默认值 -------
      expect(ret.pkg.type).toBe('normal');
      expect(ret.pkg.is_public).toBe(false);
      expect(ret.pkg.is_group).toBe(false);
    });

    test('getUserChatLog should be ok', async () => {
      let ret = await context.emitEvent('chat::getUserChatLog', {
        user_uuid: targetUUID,
      });

      expect(ret.result).toBe(true);
      expect(Array.isArray(ret.list)).toBe(true);
      expect(ret.list).toMatchObject([
        {
          uuid: testChatLog.uuid,
          sender_uuid: userInfo.uuid,
          to_uuid: targetUUID,
        },
      ]);
    });

    test('getConverseChatLog should be ok', async () => {
      let ret = await context.emitEvent('chat::getConverseChatLog', {
        converse_uuid: targetConverse,
      });

      expect(ret.result).toBe(true);
      expect(ret).toHaveProperty('list');
      expect(Array.isArray(ret.list)).toBe(true);
      expect(ret.list).toMatchObject([
        {
          uuid: testChatConverseLog.uuid,
          sender_uuid: userInfo.uuid,
          converse_uuid: targetConverse,
        },
      ]);
    });

    test('getAllUserConverse should be ok', async () => {
      let ret = await context.emitEvent('chat::getAllUserConverse');
      expect(ret.result).toBe(true);
      expect(ret).toHaveProperty('senders');
      expect(Array.isArray(ret.senders)).toBe(true);
      expect(ret.senders).toEqual(expect.arrayContaining([targetUUID]));
    });

    test('getOfflineUserConverse should be ok', async () => {
      const now = new Date();
      const lastLoginDate = new Date(now.setDate(now.getDate() - 10));
      // 获取一天前到现在的所有会话
      let ret = await context.emitEvent('chat::getOfflineUserConverse', {
        lastLoginDate,
      });
      expect(ret.result).toBe(true);
      expect(ret).toHaveProperty('senders');
      expect(Array.isArray(ret.senders)).toBe(true);
      expect(ret.senders).toEqual(expect.arrayContaining([targetUUID]));
    });
  });

  test('updateCardChatData should be ok', async () => {
    const testChat = await ChatLog.create({
      type: 'card',
      sender_uuid: userInfo.uuid,
      to_uuid: 'any user',
      data: { number: 1, string: '2' },
    });
    expect(testChat).toBeTruthy();
    expect(testChat.data).toMatchObject({ number: 1, string: '2' });

    let ret = await context.emitEvent('chat::updateCardChatData', {
      chatUUID: testChat.uuid,
      newData: { number: 3, array: ['1', '2'] },
    });
    expect(ret.result).toBe(true);
    expect(ret.log.data).toMatchObject({
      number: 3,
      array: ['1', '2'],
      string: '2',
    });

    await testChat.destroy();
  });
});
