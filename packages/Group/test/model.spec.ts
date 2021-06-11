import _ from 'lodash';
import { buildAppContext } from 'test/utils/app';
import { GroupGroup } from 'packages/Group/lib/models/group';
import {
  createTestGroup,
  createTestGroupDetail,
  createTestGroupPanel,
  createTestGroupInvite,
} from './example';
import { getTestUser, getOtherTestUser } from 'packages/Player/test/example';
import { PlayerUser } from 'packages/Player/lib/models/user';
import { regAutoClear } from 'test/utils/example';
import { genGroupDetailCacheKey, GroupDetail } from '../lib/models/detail';
import { GroupChannel } from '../lib/models/channel';
import { GroupPanel } from '../lib/models/panel';
import { GroupInviteCode } from '../lib/models/invite-code';
import shortid from 'shortid';
import { GroupVoiceChannel } from '../lib/models/voice-channel';
import { GroupPanelData } from '../lib/models/panel-data';
import { GroupInvite } from '../lib/models/invite';
import { generateRandomStr } from 'lib/helper/string-helper';

const context = buildAppContext();

regAutoClear();

describe('group model function', () => {
  let testGroup: GroupGroup;

  beforeAll(async () => {
    testGroup = await createTestGroup();
  });

  describe('GroupGroup', () => {
    test('GroupGroup.findByUUID should be ok', async () => {
      const group = await GroupGroup.findByUUID(testGroup.uuid);
      expect(group.id).toBe(testGroup.id);

      // 获取时应当返回团人数
      expect(group.toJSON()).toHaveProperty('members_count');
    });

    test('GroupGroup.getGroupFullData should be ok', async () => {
      const testGroup = await createTestGroup();
      const group = await GroupGroup.getGroupFullData(testGroup.uuid);

      expect(group.uuid).toBe(testGroup.uuid);
      expect(group).toHaveProperty('detail');
      expect(Array.isArray(group.channels)).toBe(true);
      expect(Array.isArray(group.panels)).toBe(true);
    });

    test('GroupGroup.createGroup should be ok', async () => {
      const testUser = await getTestUser();
      const userUUID = testUser.uuid;
      const name = 'test name';
      const avatar = 'test avatar';
      const subName = 'test sub name';
      const desc = 'test desc';
      const group = await GroupGroup.createGroup(
        name,
        avatar,
        subName,
        desc,
        userUUID
      );

      try {
        expect(group.name).toBe(name);
        expect(group.avatar).toBe(avatar);
        expect(group.sub_name).toBe(subName);
        expect(group.desc).toBe(desc);
        expect(group.owner_uuid).toBe(userUUID);
        expect(group.isManagerOrOwner(userUUID)).toBe(true);
        expect(
          (await group.getMembers()).map((user) => user.uuid).includes(userUUID)
        ).toBe(true);
      } finally {
        await group.destroy({ force: true });
      }
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
        expect(testTargetGroup).not.toBeNull();
        expect(testTargetGroup).toHaveProperty('detail'); // 该数据应当有detail字段
        expect(testTargetGroup).toHaveProperty('channels'); // 该数据应当有channels字段
        expect(testTargetGroup.detail).toBeNull();
        expect(Array.isArray(testTargetGroup.channels)).toBe(true);
        expect(Array.isArray(testTargetGroup.panels)).toBe(true);
      });

      test('have detail', async () => {
        const testGroup = await createTestGroup();
        await createTestGroupDetail(testGroup.id);
        const user = await getTestUser();
        await testGroup.addMember(user);
        const groups = await GroupGroup.getAllUserGroupList(user.uuid);

        expect(groups.length).toBeGreaterThan(0);

        const testTargetGroup = _.find(groups, ['uuid', testGroup.uuid]);
        expect(testTargetGroup).not.toBeNull();
        expect(testTargetGroup).toHaveProperty('detail'); // 该数据应当有detail字段
        expect(testTargetGroup.detail).not.toBeNull();
        expect(typeof testTargetGroup.detail.master_name).toBe('string');
        expect(typeof testTargetGroup.detail.disable_quick_dice).toBe(
          'boolean'
        );
      });

      test('have ordered panels', async () => {
        const testGroup = await createTestGroup();
        await createTestGroupPanel(testGroup.id, { order: 2 });
        await createTestGroupPanel(testGroup.id, { order: 1 });
        const user = await getTestUser();
        await testGroup.addMember(user);

        const groups = await GroupGroup.getAllUserGroupList(user.uuid);

        const testTargetGroup = groups.find(
          (group) => group.uuid === testGroup.uuid
        );
        expect(testTargetGroup).not.toBeNull();
        expect(testTargetGroup.panels).not.toBeNull();
        const panels = testTargetGroup.panels;
        expect(panels.length).toBe(2);
        expect(panels[0].order).toBe(1);
        expect(panels[1].order).toBe(2);
      });
    });

    test.todo('GroupGroup.getGroupRangeChatLog should be ok');

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

    test.todo('GroupGroup.setMemberToManager');

    test.todo('GroupGroup.setManagerToMember');

    test.todo('GroupGroup.tickMember');

    test('group.getMemberByUUID should be ok', async () => {
      const testGroup = await createTestGroup();
      const testUser = await getOtherTestUser('admin9');

      await testGroup.addMember(testUser);

      const group = await GroupGroup.findByPk(testGroup.id);
      const member = await group.getMemberByUUID(testUser.uuid);

      expect(member).not.toBeNull();
      expect(member.uuid).toBe(testUser.uuid);
    });

    test('group.isMember should be ok', async () => {
      const testGroup = await createTestGroup();
      const testUser = await getOtherTestUser('admin9');

      await testGroup.addMember(testUser);

      const group = await GroupGroup.findByPk(testGroup.id);
      const isMember = await group.isMember(testUser.uuid);

      expect(isMember).toBe(true);
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

    describe('group.getAllGroupMember should be ok', () => {
      test('should get correct members', async () => {
        const testGroup = await createTestGroup();
        const testUser = await getTestUser();
        await testGroup.addMember(testUser);

        const members = await testGroup.getAllGroupMember();

        expect(members.length).toBeGreaterThan(0);
        expect(members[0].uuid).toBe(testUser.uuid);
      });
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

    describe('GroupDetail.getGroupDetail', () => {
      let testGroup: GroupGroup;
      let testGroupDetail: GroupDetail;

      beforeAll(async () => {
        testGroup = await createTestGroup();
        testGroupDetail = await createTestGroupDetail(testGroup.id);
      });

      beforeEach(async () => {
        await context.app.cache.remove(genGroupDetailCacheKey(testGroup.uuid));
      });

      afterEach(async () => {
        await context.app.cache.remove(genGroupDetailCacheKey(testGroup.uuid));
      });

      test('GroupDetail.getGroupDetail should be ok', async () => {
        const detail = await GroupDetail.getGroupDetail(testGroup.uuid);
        expect(detail.id).toBe(testGroupDetail.id);
      });

      test('GroupDetail.getGroupDetail should have cache', async () => {
        const testGroupUUID = testGroup.uuid;

        const detail = await GroupDetail.getGroupDetail(testGroupUUID);
        expect(detail.id).toBe(testGroupDetail.id);

        const cache = await context.app.cache.get(
          genGroupDetailCacheKey(testGroupUUID)
        );
        expect(_.get(cache, 'id')).toBe(testGroupDetail.id);

        const detail2 = await GroupDetail.getGroupDetail(testGroupUUID);
        expect(detail2.id).toBe(testGroupDetail.id);
      });

      test('GroupDetail.getGroupDetail should be update cache if modify', async () => {
        const testGroupUUID = testGroup.uuid;

        const detail = await GroupDetail.getGroupDetail(testGroupUUID);
        expect(detail.id).toBe(testGroupDetail.id);

        const cache = await context.app.cache.get(
          genGroupDetailCacheKey(testGroupUUID)
        );
        expect(_.get(cache, 'id')).toBe(testGroupDetail.id);

        // 修改数据, 应当清空缓存
        const testPlayer = await getTestUser();
        const randomMasterName = generateRandomStr();
        await GroupDetail.saveGroupDetail(testGroupUUID, testPlayer.uuid, {
          master_name: randomMasterName,
        });

        const cache2 = await context.app.cache.get(
          genGroupDetailCacheKey(testGroupUUID)
        );
        expect(_.get(cache2, 'master_name')).toBe(randomMasterName);
      });
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
      } finally {
        await channel.destroy();
      }
    });
  });

  describe('GroupVoiceChannel', () => {
    test('GroupVoiceChannel.createChannel should be ok', async () => {
      const testUser = await getTestUser();
      const name = 'test channel';
      const desc = 'test channel desc';
      const channel = await GroupVoiceChannel.createVoiceChannel(
        testGroup.uuid,
        testUser.uuid,
        name,
        desc
      );

      try {
        expect(channel.groupId).toBe(testGroup.id);
        expect(channel.name).toBe(name);
        expect(channel.desc).toBe(desc);
      } finally {
        await channel.destroy();
      }
    });
  });

  describe('GroupPanel', () => {
    describe('GroupPanel.createPanel', () => {
      test('GroupPanel.createPanel should be ok', async () => {
        const testUser = await getTestUser();
        const testGroup = await createTestGroup();
        const { groupPanel: panel } = await GroupPanel.createPanel(
          'test name',
          'test',
          {},
          testGroup.uuid,
          testUser.uuid
        );

        try {
          expect(panel).toHaveProperty('uuid', expect.any(String));
          expect(panel.name).toBe('test name');
          expect(panel.type).toBe('test');
          expect(panel.groupId).toBe(testGroup.id);
        } finally {
          await panel.destroy({ force: true });
        }
      });

      test.todo('GroupPanel.createPanel should be create channel');
    });

    test('GroupPanel.removePanel should be ok', async () => {
      const testUser = await getTestUser();
      const testGroup = await createTestGroup();
      const testPanel = await createTestGroupPanel(testGroup.id);

      const fn = jest.spyOn(GroupPanel.prototype, 'destroyTargetRecord');
      await GroupPanel.removePanel(testPanel.uuid, testUser.uuid);

      expect(await GroupPanel.findByPk(testPanel.id)).toBeNull();
      expect(fn).toHaveBeenCalled();
      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('GroupPanel.getPanelByGroup should be ok', async () => {
      const group = await createTestGroup();
      const panel2 = await createTestGroupPanel(group.id, { order: 2 });
      const panel1 = await createTestGroupPanel(group.id, { order: 1 });

      const panels = await GroupPanel.getPanelByGroup(group);

      // should be order by id asc
      expect(panels.map((p) => p.id)).toMatchObject([panel1.id, panel2.id]);
    });

    test('GroupPanel.getGroupPanelsByType should be ok', async () => {
      const testUser = await getTestUser();
      const testGroup = await createTestGroup();
      const testPanel = await createTestGroupPanel(testGroup.id);

      const panels = await GroupPanel.getGroupPanelsByType(
        testGroup.uuid,
        'test' as any,
        testUser.uuid
      );

      expect(Array.isArray(panels)).toBe(true);
      expect(panels.length).toBe(1);
      expect(panels.map((p) => p.id)).toMatchObject([testPanel.id]);

      const panels2 = await GroupPanel.getGroupPanelsByType(
        testGroup.uuid,
        'other' as any,
        testUser.uuid
      );
      expect(Array.isArray(panels2)).toBe(true);
      expect(panels2.length).toBe(0);
    });

    test('GroupPanel.updateGroupPanelOrder should be ok', async () => {
      const testUser = await getTestUser();
      const group = await createTestGroup();

      const panel1 = await createTestGroupPanel(group.id, { order: 1 });
      const panel2 = await createTestGroupPanel(group.id, { order: 2 });

      const affectedRow = await GroupPanel.updateGroupPanelOrder(
        group.uuid,
        testUser.uuid,
        [
          {
            uuid: panel1.uuid,
            order: 3,
          },
        ]
      );

      expect(affectedRow).toBe(1); // 影响字段数为 1

      // 重新请求以进行进一步确认
      expect(await GroupPanel.getPanelByGroup(group)).toMatchObject([
        {
          uuid: panel2.uuid,
          order: 2,
        },
        {
          uuid: panel1.uuid,
          order: 3,
        },
      ]);
    });

    test('GroupPanel.updatePanelInfo should be ok', async () => {
      const testUser = await getTestUser();
      const group = await createTestGroup();
      const panel = await createTestGroupPanel(group.id);
      const targetName = 'new panel name';

      const newPanel = await GroupPanel.updatePanelInfo(
        panel.uuid,
        testUser.uuid,
        {
          name: targetName,
        }
      );

      expect(newPanel.uuid).toBe(panel.uuid);
      expect(newPanel.name).toBe(targetName);
    });
  });

  describe('GroupPanelData', () => {
    describe('set data', () => {
      test('once', async () => {
        const testGroup = await createTestGroup();
        const testGroupPanel = await createTestGroupPanel(testGroup.id);
        const testUser = await getTestUser();
        const testUUID = testGroupPanel.uuid;

        await GroupPanelData.setGroupPanelData(
          testUUID,
          {
            test: 1,
          },
          testUser.uuid
        );

        try {
          const ret = await GroupPanelData.findOne({
            where: {
              group_panel_uuid: testUUID,
            },
          });

          expect(ret).not.toBeNull();
          expect(ret.group_panel_uuid).toBe(testUUID);
          expect(ret.data).toMatchObject({
            test: 1,
          });
        } finally {
          await GroupPanelData.destroy({
            where: {
              group_panel_uuid: testUUID,
            },
          });
        }
      });

      test('one more times', async () => {
        const testGroup = await createTestGroup();
        const testGroupPanel = await createTestGroupPanel(testGroup.id);
        const testUser = await getTestUser();
        const testUUID = testGroupPanel.uuid;

        await GroupPanelData.setGroupPanelData(
          testUUID,
          {
            test: 1,
          },
          testUser.uuid
        );

        try {
          const ret = await GroupPanelData.findOne({
            where: {
              group_panel_uuid: testUUID,
            },
          });

          expect(ret).not.toBeNull();
          expect(ret.group_panel_uuid).toBe(testUUID);
          expect(ret.data).toMatchObject({
            test: 1,
          });

          await GroupPanelData.setGroupPanelData(
            testUUID,
            {
              test: 2,
            },
            testUser.uuid
          );

          const ret2 = await GroupPanelData.findOne({
            where: {
              group_panel_uuid: testUUID,
            },
          });

          expect(ret2).not.toBeNull();
          expect(ret2.group_panel_uuid).toBe(testUUID);
          expect(ret2.data).toMatchObject({
            test: 2,
          });
        } finally {
          await GroupPanelData.destroy({
            where: {
              group_panel_uuid: testUUID,
            },
          });
        }
      });
    });

    test('get data', async () => {
      const testUUID = 'get-test';

      await GroupPanelData.create({
        group_panel_uuid: testUUID,
        data: {
          str: 'any',
        },
      });

      try {
        const data = await GroupPanelData.getGroupPanelData(testUUID);
        expect(data).toMatchObject({
          str: 'any',
        });
      } finally {
        await GroupPanelData.destroy({
          where: {
            group_panel_uuid: testUUID,
          },
        });
      }
    });
  });

  describe('GroupInvite', () => {
    test('GroupInvite.getAllPendingInvites should be ok', async () => {
      const testUser = await getOtherTestUser('admin9');
      const invite1 = await createTestGroupInvite(testUser.uuid);
      const invite2 = await createTestGroupInvite(testUser.uuid);
      const invite3 = await createTestGroupInvite(testUser.uuid);

      const inviteList = await GroupInvite.getAllPendingInvites(testUser.uuid);
      const inviteListUUIDs = inviteList.map((x) => x.uuid);

      expect(inviteListUUIDs.includes(invite1.uuid)).toBe(true);
      expect(inviteListUUIDs.includes(invite2.uuid)).toBe(true);
      expect(inviteListUUIDs.includes(invite3.uuid)).toBe(true);
    });

    test('GroupInvite.agreeInvite should be ok', async () => {
      const testUser = await getOtherTestUser('admin9');
      const invite = await createTestGroupInvite(testUser.uuid);

      await GroupInvite.agreeInvite(invite.uuid, testUser.uuid);

      const res: GroupInvite | null = await GroupInvite.findOne({
        where: { uuid: invite.uuid },
      });

      expect(res).not.toBeNull();
      expect(res.is_agree).toBe(true);
      expect(res.is_refuse).toBe(false);
    });

    test('GroupInvite.refuseInvite should be ok', async () => {
      const testUser = await getOtherTestUser('admin9');
      const invite = await createTestGroupInvite(testUser.uuid);

      await GroupInvite.refuseInvite(invite.uuid, testUser.uuid);

      const res: GroupInvite | null = await GroupInvite.findOne({
        where: { uuid: invite.uuid },
      });

      expect(res).not.toBeNull();
      expect(res.is_agree).toBe(false);
      expect(res.is_refuse).toBe(true);
    });
  });

  describe('GroupInviteCode', () => {
    test('GroupInviteCode.createInvite', async () => {
      const testUser = await getTestUser();
      const testGroup = await createTestGroup();

      const invite = await GroupInviteCode.createInvite(
        testGroup.uuid,
        testUser.uuid
      );

      try {
        expect(invite.group_uuid).toBe(testGroup.uuid);
        expect(invite.from_uuid).toBe(testUser.uuid);
        expect(invite.expiredAt).toBe(undefined);
        expect(invite.times).toBe(-1);
        expect(shortid.isValid(invite.code)).toBe(true);
      } finally {
        await invite.destroy();
      }
    });
  });
});
