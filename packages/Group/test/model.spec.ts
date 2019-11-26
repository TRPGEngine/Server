import _ from 'lodash';
import { buildAppContext } from 'test/utils/app';
import { ActorActor } from 'packages/Actor/lib/models/actor';
import { GroupGroup } from 'packages/Group/lib/models/group';
import { GroupActor } from 'packages/Group/lib/models/actor';
import { createTestActor } from 'packages/Actor/test/example';
import { createTestGroup, createTestGroupActor } from './example';
import { getTestUser } from 'packages/Player/test/example';

const context = buildAppContext();

describe('group model function', () => {
  let testActor: ActorActor;
  let testGroup: GroupGroup;
  let testGroupActor: GroupActor;

  beforeAll(async () => {
    testActor = await createTestActor();

    testGroup = await createTestGroup();

    testGroupActor = await createTestGroupActor(testGroup.id);
  });

  afterAll(async () => {
    await _.invoke(testActor, 'destroy');
    await _.invoke(testGroup, 'destroy');
    await _.invoke(testGroupActor, 'destroy');
  });

  describe('GroupGroup', () => {
    test('GroupGroup.findGroupActorsByUUID should be ok', async () => {
      const actors = await GroupGroup.findGroupActorsByUUID(testGroup.uuid);

      expect(Array.isArray(actors)).toBe(true);
      expect(actors).toHaveLength(1);
      expect(actors[0].toJSON()).toMatchObject({
        id: testGroupActor.id,
        uuid: testGroupActor.uuid,
      });
    });
  });

  describe('GroupActor', () => {
    test('GroupActor.addApprovalGroupActor should be ok', async () => {
      const testUser = await getTestUser();
      const groupActor = await GroupActor.addApprovalGroupActor(
        testGroup.uuid,
        testActor.uuid,
        testUser.uuid
      );

      expect(groupActor.toJSON()).toHaveProperty('actor');
      expect(groupActor.toJSON()).toHaveProperty('group');

      // 角色信息复制
      expect(groupActor.name).toBe(testActor.name);
      expect(groupActor.desc).toBe(testActor.desc);
      expect(groupActor.avatar).toBe(testActor.avatar);

      await groupActor.destroy();
    });

    test('GroupActor.agreeApprovalGroupActor should be ok', async () => {
      const testUser = await getTestUser();
      const testGroupActorTmp = await createTestGroupActor(testGroup.id);
      await testGroupActorTmp.setActor(testActor);

      const groupActor = await GroupActor.agreeApprovalGroupActor(
        testGroupActorTmp.uuid,
        testUser.uuid
      );

      expect(groupActor).toMatchObject({
        uuid: testGroupActorTmp.uuid,
        passed: true,
        actor_info: testActor.info, // 同意申请后角色的属性应当写入团角色信息
      });
    });

    test('GroupActor.refuseApprovalGroupActor should be ok', async () => {
      const testUser = await getTestUser();
      const testGroupActor = await createTestGroupActor(testGroup.id);
      const testGroupActorUUID = testGroupActor.uuid;
      await GroupActor.refuseApprovalGroupActor(
        testGroupActorUUID,
        testUser.uuid
      );

      const groupActor = await GroupActor.findOne({
        where: {
          uuid: testGroupActorUUID,
        },
      });
      expect(groupActor).toBe(null);
    });
  });
});
