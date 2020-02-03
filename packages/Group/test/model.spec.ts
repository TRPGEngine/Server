import _ from 'lodash';
import { buildAppContext } from 'test/utils/app';
import { ActorActor } from 'packages/Actor/lib/models/actor';
import { GroupGroup } from 'packages/Group/lib/models/group';
import { GroupActor } from 'packages/Group/lib/models/actor';
import { createTestActor } from 'packages/Actor/test/example';
import { createTestGroup, createTestGroupActor } from './example';
import { getTestUser, getOtherTestUser } from 'packages/Player/test/example';
import { PlayerUser } from 'packages/Player/lib/models/user';
import testExampleStack from 'test/utils/example';

const context = buildAppContext();

testExampleStack.regAfterAll();

describe('group model function', () => {
  let testActor: ActorActor;
  let testGroup: GroupGroup;
  let testGroupActor: GroupActor;

  beforeAll(async () => {
    testActor = await createTestActor();
    testGroup = await createTestGroup();
  });

  beforeEach(async () => {
    testGroupActor = await createTestGroupActor(testGroup.id);
  });

  afterEach(async () => {
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
      expect(actors[0]).toHaveProperty('owner'); // 需要有owner信息
      expect(actors[0].owner).not.toBeNull();
      expect(actors[0].owner.id).toBe(testGroupActor.ownerId);
    });

    describe('GroupGroup.searchGroup should be ok', () => {
      /**
       * 检测一个团UUID是否应该在搜索结果中
       * @param uuid 团UUID
       * @param results 搜索结果
       */
      const checkGroupExistInSearchResult = (
        uuid: string,
        results: GroupGroup[]
      ): boolean => {
        return results.map((x) => x.uuid).includes(uuid);
      };

      /**
       *
       * @param testGroup 测试的团
       * @param shouldExist 是否应该在测试结果中
       */
      const checkAllSearchType = async (
        testGroup: GroupGroup,
        shouldExist: boolean
      ) => {
        const testGroupUUID = testGroup.uuid;

        expect(
          checkGroupExistInSearchResult(
            testGroupUUID,
            await GroupGroup.searchGroup(testGroupUUID, 'uuid')
          )
        ).toBe(shouldExist);
        expect(
          checkGroupExistInSearchResult(
            testGroupUUID,
            await GroupGroup.searchGroup(testGroup.name, 'groupname')
          )
        ).toBe(shouldExist);
        expect(
          checkGroupExistInSearchResult(
            testGroupUUID,
            await GroupGroup.searchGroup(testGroup.desc, 'groupdesc')
          )
        ).toBe(shouldExist);
      };

      test('normal search', async () => {
        const testGroupTmp = await createTestGroup();

        await checkAllSearchType(testGroupTmp, true);
      });

      test('cannot search if not allow search', async () => {
        const testGroupTmp = await createTestGroup();
        testGroupTmp.allow_search = false;
        await testGroupTmp.save();

        await checkAllSearchType(testGroupTmp, false);
      });
    });

    test('GroupGroup.addGroupMember should be ok', async () => {
      const testUser = await getTestUser();
      await GroupGroup.addGroupMember(
        testGroup.uuid,
        testUser.uuid,
        testUser.uuid
      );

      const group = await GroupGroup.findByUUID(testGroup.uuid);
      const members: PlayerUser[] = await group.getMembers();
      expect(
        members.findIndex((m) => m.uuid === testUser.uuid)
      ).toBeGreaterThanOrEqual(0);
    });

    test('GroupGroup.removeGroupMember should be ok', async () => {
      const testUser9 = await getOtherTestUser('admin9');
      await testGroup.addMember(testUser9);

      expect((await testGroup.getMembers()).map((x) => x.uuid)).toContain(
        testUser9.uuid
      );

      await GroupGroup.removeGroupMember(testGroup.uuid, testUser9.uuid);

      expect(
        (await testGroup.getMembers()).map<string>((x) => x.uuid)
      ).not.toContain(testUser9.uuid);
    });

    test('group.getMembersCount should be ok', async () => {
      const testUser = await getOtherTestUser('admin9');
      const num = await testGroup.getMembersCount();

      await testGroup.addMember(testUser);

      const num2 = await testGroup.getMembersCount();
      expect(num2).toBe(num + 1);

      await testGroup.removeMember(testUser);

      const num3 = await testGroup.getMembersCount();
      expect(num3).toBe(num);
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

    test('GroupActor.remove should be ok', async () => {
      const testGroupActor = await createTestGroupActor(testGroup.id);
      const testUser = await getTestUser();
      await GroupActor.remove(testGroupActor.uuid, testUser.uuid);

      expect(
        await GroupActor.findOne({
          where: {
            uuid: testGroupActor.uuid,
          },
        })
      ).toBeNull();
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
