import { ChatConverse } from '../lib/models/converse';
import { getTestUser, getOtherTestUser } from 'packages/Player/test/example';
import { buildAppContext } from 'test/utils/app';
import { ChatLog } from '../lib/models/log';
import { ChatConverseAck } from '../lib/models/converse-ack';
import { generateChatMsgUUID } from '../lib/utils';
import { createTestChatlog, createTestChatlogPayload } from './example';
import { sleep } from 'lib/helper/utils';
import { generateRandomStr } from 'lib/helper/string-helper';

const context = buildAppContext();

describe('ChatLog', () => {
  test.todo('ChatLog.findDeepByUUID should be ok');
  test.todo('ChatLog.updateByUUID should be ok');
  test.todo('ChatLog.sendConverseSystemMsg should be ok');

  test('should save 4 byte message', async () => {
    const testUser = await getTestUser();
    const message = new Buffer([0xf0, 0x9f, 0x8f, 0x83]).toString(); // 🏃

    // 直接检查数据库能否正常写入
    const chatlog = await ChatLog.create({
      sender_uuid: testUser.uuid,
      message,
    });

    await chatlog.destroy();
  });

  test.todo('ChatLog.getCachedChatLogByUUID');
  test.todo('ChatLog.appendCachedChatLog');
  test.todo('ChatLog.updateCachedChatLog');

  describe('ChatLog.dumpCachedChatLog', () => {
    test('long message', async () => {
      let longMessage = '';
      for (let i = 0; i < 1000; i++) {
        longMessage += '12345678';
      }
      const payload = await createTestChatlogPayload({
        message: longMessage,
      });

      ChatLog.appendCachedChatLog(payload);

      await sleep(100);

      await ChatLog.dumpCachedChatLog();

      const lists: ChatLog[] = await ChatLog.findAll({
        where: {
          type: payload.type,
          date: payload.date,
        },
      });

      try {
        expect(lists[0].uuid).toBe(payload.uuid);
        expect(lists.map((item) => item.message).join('')).toBe(longMessage);
      } finally {
        for (const item of lists) {
          await item.destroy();
        }
      }
    });
  });

  test.only('ChatLog.searchGroupChatLogInDatabaseByMessage should be ok', async () => {
    const testGroupUUID = generateRandomStr();

    const chatlog = await createTestChatlog({
      group_uuid: testGroupUUID,
      is_group: true,
      message: 'the brown fox jumps over the lazy dog',
    });

    const logUUID = chatlog.uuid;

    const res1 = await ChatLog.searchGroupChatLogInDatabaseByMessage(
      testGroupUUID,
      'fox'
    );
    expect(res1.findIndex((x) => x.uuid === logUUID)).toBeGreaterThanOrEqual(0);

    const res2 = await ChatLog.searchGroupChatLogInDatabaseByMessage(
      testGroupUUID,
      'r t'
    );
    expect(res2.findIndex((x) => x.uuid === logUUID)).toBeGreaterThanOrEqual(0);
  });
});

describe('chatconverse model', () => {
  test('ChatConverse.createMultiConverse should be ok', async () => {
    const testUser1 = await getTestUser();
    const testUser2 = await getOtherTestUser('admin9');
    const testUser3 = await getOtherTestUser('admin8');
    const uuids = [testUser1.uuid, testUser2.uuid, testUser3.uuid];

    const converse = await ChatConverse.createMultiConverse(undefined, uuids);

    try {
      const participants = await converse.getParticipants();
      expect(participants).toHaveLength(3);
      expect(new Set(participants.map((x) => x.uuid))).toMatchObject(
        new Set(uuids)
      ); // 无序比较

      expect(typeof converse.name).toBe('string');
      expect(converse.name.startsWith(testUser1.getName())).toBe(true);
      expect(converse.name.endsWith('的多人会话')).toBe(true);
    } finally {
      await converse.destroy();
    }
  });
});

describe('ChatConverseAck', () => {
  test('ChatConverseAck.setConverseAck should be ok', async () => {
    const testUser = await getTestUser();
    const msgUUID = generateChatMsgUUID();
    await ChatConverseAck.setConverseAck(testUser.uuid, testUser.uuid, msgUUID);

    const ack: ChatConverseAck = await ChatConverseAck.findOne({
      where: {
        user_uuid: testUser.uuid,
        converse_uuid: testUser.uuid,
      },
    });

    try {
      expect(ack.user_uuid).toBe(testUser.uuid);
      expect(ack.converse_uuid).toBe(testUser.uuid);
      expect(ack.last_log_uuid).toBe(msgUUID);

      // 多次调用 测试更新
      const msgUUID2 = generateChatMsgUUID();
      await ChatConverseAck.setConverseAck(
        testUser.uuid,
        testUser.uuid,
        msgUUID2
      );
      const ack2: ChatConverseAck = await ChatConverseAck.findOne({
        where: {
          user_uuid: testUser.uuid,
          converse_uuid: testUser.uuid,
        },
      });
      expect(ack2.last_log_uuid).toBe(msgUUID2);
    } finally {
      await ack.destroy();
    }
  });
});
