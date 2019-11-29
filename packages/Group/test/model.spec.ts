import _ from 'lodash';
import { buildAppContext } from 'test/utils/app';
import { ActorActor } from 'packages/Actor/lib/models/actor';
import { GroupGroup } from 'packages/Group/lib/models/group';
import { GroupActor } from 'packages/Group/lib/models/actor';
import { createTestActor } from 'packages/Actor/test/example';
import { createTestGroup, createTestGroupActor } from './example';
import { getTestUser, testUserInfo } from 'packages/Player/test/example';

const context = buildAppContext();

describe('group model function', () => {
  let testActor: ActorActor;
  let testGroup: GroupGroup;
  let testGroupActor: GroupActor;

  beforeAll(async () => {
    testActor = await createTestActor();
    testGroup = await createTestGroup();
  });

  afterAll(async () => {
    await _.invoke(testActor, 'destroy');
    await _.invoke(testGroup, 'destroy');
  });

  beforeEach(async () => {
    testGroupActor = await createTestGroupActor(testGroup.id);
  });

  afterEach(async () => {
    await _.invoke(testGroupActor, 'destroy');
    testGroupActor = null;
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
    test('GroupActor.editActorInfo should be ok', async () => {
      const testUser = await getTestUser();
      const targetInfo = {
        _name: 'target_name',
        _desc: 'target_desc',
        _avatar: 'target_avatar',
        data: 'sda',
      };

      await GroupActor.editActorInfo(
        testGroupActor.uuid,
        targetInfo,
        testUser.uuid
      );

      const ga: GroupActor = await GroupActor.findOne({
        where: {
          uuid: testGroupActor.uuid,
        },
      });
      expect(ga.name).toBe(targetInfo._name);
      expect(ga.desc).toBe(targetInfo._desc);
      expect(ga.avatar).toBe(targetInfo._avatar);
      expect(ga.actor_info).toMatchObject(targetInfo);
    });

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
      await testGroupActor.setActor(testActor);

      const groupActor = await GroupActor.agreeApprovalGroupActor(
        testGroupActor.uuid,
        testUser.uuid
      );

      expect(groupActor).toMatchObject({
        uuid: testGroupActor.uuid,
        passed: true,
        actor_info: testActor.info, // 同意申请后角色的属性应当写入团角色信息
        actor_template_uuid: testActor.template_uuid, // 同意申请后角色的属性应当写入团角色模板UUID
      });
    });

    test('GroupActor.refuseApprovalGroupActor should be ok', async () => {
      const testUser = await getTestUser();
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

    test('GroupActor.getDetailByUUID should be ok', async () => {
      const groupActor = await GroupActor.getDetailByUUID(testGroupActor.uuid);

      expect(groupActor).toBeTruthy();
      expect(groupActor).toHaveProperty('uuid');
      expect(groupActor).toHaveProperty('actor_uuid');
      expect(groupActor).toHaveProperty('actor_info');
      expect(groupActor).toHaveProperty('actor_template_uuid');
      expect(groupActor).toHaveProperty('name');
      expect(groupActor).toHaveProperty('desc');
      expect(groupActor).toHaveProperty('avatar');
      expect(groupActor).toHaveProperty('passed');
      expect(groupActor).toHaveProperty('enabled');
      expect(groupActor).toHaveProperty('updatedAt');
      expect(groupActor).toMatchObject({
        uuid: testGroupActor.uuid,
        actor_uuid: testGroupActor.actor_uuid,
        actor_info: testGroupActor.actor_info,
        name: testGroupActor.name,
      });
    });
  });
});
