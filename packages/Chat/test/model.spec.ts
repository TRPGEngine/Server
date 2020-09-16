import { ChatConverse } from '../lib/models/converse';
import { getTestUser, getOtherTestUser } from 'packages/Player/test/example';
import { buildAppContext } from 'test/utils/app';
import { ChatLog } from '../lib/models/log';

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
