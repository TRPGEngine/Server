import _ from 'lodash';
import { buildAppContext } from 'test/utils/app';
import { ActorActor } from 'packages/Actor/lib/models/actor';
import { GroupGroup } from 'packages/Group/lib/models/group';
import { GroupActor } from 'packages/Group/lib/models/actor';
import { createTestActor } from 'packages/Actor/test/example';
import {
  createTestGroup,
  createTestGroupActor,
  createTestGroupDetail,
} from './example';
import { getTestUser, getOtherTestUser } from 'packages/Player/test/example';
import { PlayerUser } from 'packages/Player/lib/models/user';
import testExampleStack from 'test/utils/example';
import { GroupDetail } from '../lib/models/detail';
import { GroupChannel } from '../lib/models/channel';

const context = buildAppContext();

testExampleStack.regAfterAll();

describe('group model function', () => {
  let testActor: ActorActor;
  let testGroup: GroupGroup;

  beforeAll(async () => {
    testActor = await createTestActor();
    testGroup = await createTestGroup();
  });

  describe('GroupGroup', () => {
    test('GroupGroup.findByUUID should be ok', async () => {
      const group = await GroupGroup.findByUUID(testGroup.uuid);
      expect(group.id).toBe(testGroup.id);

      // 获取时应当返回团人数
      expect(group.toJSON()).toHaveProperty('members_count');
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

    describe('GroupGroup.getAllUserGroupList should be ok', () => {
      test('have no detail', async () => {
        const testGroup = await createTestGroup();
        const user = await getTestUser();
        await testGroup.addMember(user);
        const groups = await GroupGroup.getAllUserGroupList(user.uuid);

        expect(groups.length).toBeGreaterThan(0);

        const testTargetGroup = _.find(groups, ['uuid', testGroup.uuid]);
        expect(testTargetGroup).toHaveProperty('detail'); // 该数据应当有detail字段
        expect(testTargetGroup).toHaveProperty('channels'); // 该数据应当有channels字段
        expect(testTargetGroup.detail).toBeNull();
        expect(Array.isArray(testTargetGroup.channels)).toBe(true);
      });
      test('have detail', async () => {
        const testGroup = await createTestGroup();
        await createTestGroupDetail(testGroup.id);
        const user = await getTestUser();
        await testGroup.addMember(user);
        const groups = await GroupGroup.getAllUserGroupList(user.uuid);

        expect(groups.length).toBeGreaterThan(0);

        const testTargetGroup = _.find(groups, ['uuid', testGroup.uuid]);
        expect(testTargetGroup).toHaveProperty('detail'); // 该数据应当有detail字段
        expect(testTargetGroup.detail).not.toBeNull();
        expect(typeof testTargetGroup.detail.master_name).toBe('string');
        expect(typeof testTargetGroup.detail.disable_quick_dice).toBe(
          'boolean'
        );
      });
    });

    test.todo('GroupGroup.getGroupChatLog should be ok');

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

    test('GroupGroup.getMemberCurrentGroupActorUUID should be ok', async () => {
      const testUser = await getTestUser();
      const testGroup = await createTestGroup();

      await testGroup.addMember(testUser);

      expect(
        await GroupGroup.getMemberCurrentGroupActorUUID(
          testGroup.uuid,
          testUser.uuid
        )
      ).toBeNull();

      const testSelectedGroupActorUUID = 'any';
      const member = await testGroup.getMemberByUUID(testUser.uuid);
      _.set(
        member,
        'group_group_members.selected_group_actor_uuid',
        testSelectedGroupActorUUID
      );
      await member['group_group_members'].save();

      expect(
        await GroupGroup.getMemberCurrentGroupActorUUID(
          testGroup.uuid,
          testUser.uuid
        )
      ).toBe(testSelectedGroupActorUUID);

      await testGroup.removeMember(testUser);
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

    test('group.members_count should be update when add/remove member', async () => {
      const testUser = await getOtherTestUser('admin9');

      const testGroup1 = await GroupGroup.findByPk(testGroup.id);
      const num1 = testGroup1.members_count ?? 0;

      await testGroup.addMember(testUser);

      const testGroup2 = await GroupGroup.findByPk(testGroup.id);
      const num2 = testGroup2.members_count;
      expect(num2).toBe(num1 + 1);

      await testGroup.removeMember(testUser);

      const testGroup3 = await GroupGroup.findByPk(testGroup.id);
      const num3 = testGroup3.members_count;
      expect(num3).toBe(num1);
    });
  });

  describe('GroupActor', () => {
    let testGroupActor: GroupActor;

    beforeEach(async () => {
      testGroupActor = await createTestGroupActor(testGroup.id);
    });

    afterEach(async () => {
      testGroupActor = null;
    });

    test('GroupGroup.findGroupActorsByUUID should be ok', async () => {
      const actors = await GroupGroup.findGroupActorsByUUID(testGroup.uuid);

      expect(Array.isArray(actors)).toBe(true);
      expect(actors.length).toBeGreaterThanOrEqual(1);
      const checkedActor = actors.find((a) => a.id === testGroupActor.id);
      expect(checkedActor).not.toBeNull();
      expect(checkedActor.toJSON()).toMatchObject({
        id: testGroupActor.id,
        uuid: testGroupActor.uuid,
      });
      expect(checkedActor).toHaveProperty('owner'); // 需要有owner信息
      expect(checkedActor.owner).not.toBeNull();
      expect(checkedActor.owner.id).toBe(testGroupActor.ownerId);
    });

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

      try {
        expect(groupActor.toJSON()).toHaveProperty('actor');
        expect(groupActor.toJSON()).toHaveProperty('group');

        // 角色信息复制
        expect(groupActor.name).toBe(testActor.name);
        expect(groupActor.desc).toBe(testActor.desc);
        expect(groupActor.avatar).toBe(testActor.avatar);
      } finally {
        await groupActor.destroy();
      }
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

    test('GroupActor.assignGroupActor should be ok', async () => {
      const testUser = await getTestUser();
      const testUser9 = await getOtherTestUser('admin9');
      testGroupActor.passed = true;
      await testGroupActor.save();

      await GroupActor.assignGroupActor(
        testGroup.uuid,
        testGroupActor.uuid,
        testUser.uuid,
        testUser9.uuid
      );

      const groupActor: GroupActor = await GroupActor.findOne({
        where: {
          uuid: testGroupActor.uuid,
        },
      });
      const owner: PlayerUser = await groupActor.getOwner();

      expect(owner.uuid).toBe(testUser9.uuid);
    });
  });

  describe('GroupDetail', () => {
    test('GroupDetail.saveGroupDetail should be ok', async () => {
      const master_name = '地下城主';
      const testUser = await getTestUser();
      await GroupDetail.saveGroupDetail(testGroup.uuid, testUser.uuid, {
        master_name,
      });

      const detail: GroupDetail = await GroupDetail.findOne({
        where: {
          groupId: testGroup.id,
        },
      });

      expect(detail).not.toBeNull();
      expect(detail.groupId).toBe(testGroup.id);
      expect(detail.master_name).toBe(master_name);

      await detail.destroy();
    });
  });

  describe('GroupChannel', () => {
    test('GroupChannel.createChannel should be ok', async () => {
      const testUser = await getTestUser();
      const name = 'test channel';
      const desc = 'test channel desc';
      const channel = await GroupChannel.createChannel(
        testGroup.uuid,
        testUser.uuid,
        name,
        desc
      );

      try {
        expect(channel.groupId).toBe(testGroup.id);
        expect(channel.name).toBe(name);
        expect(channel.desc).toBe(desc);
        expect(Array.isArray(channel.members)).toBe(true);
        expect(channel.members.length).toBeGreaterThan(0);
        expect(channel.members.includes(testUser.uuid)).toBe(true);
      } finally {
        await channel.destroy();
      }
    });
  });
});
