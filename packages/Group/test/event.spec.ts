import { buildAppContext } from 'test/utils/app';
import { handleLogin, handleLogout } from 'packages/Player/test/example';
import { PlayerUser } from 'packages/Player/lib/models/user';
import { generateRandomStr } from 'test/utils/utils';
import { GroupGroup } from '../lib/models/group';
import { GroupRequest } from '../lib/models/request';
import { GroupInvite } from '../lib/models/invite';
import { ActorActor } from 'packages/Actor/lib/models/actor';
import { GroupActor } from '../lib/models/actor';
import { createTestActor } from 'packages/Actor/test/example';
import { createTestGroupActor, createTestGroup } from './example';
import testExampleStack from 'test/utils/example';

const context = buildAppContext();

let testUser: PlayerUser;

beforeAll(async () => {
  testUser = await handleLogin(context);
});

afterAll(async () => {
  await handleLogout(context, testUser);
});

describe('group action', () => {
  testExampleStack.regAfterAll();
  let testGroup: GroupGroup;

  beforeAll(async () => {
    testGroup = await createTestGroup();
    // await testGroup.addMember(testUser, {
    //   through: {
    //     selected_group_actor_uuid: 'test selected_group_actor_uuid',
    //   },
    // });
  });

  test('create should be ok', async () => {
    let ret = await context.emitEvent('group::create', {
      name: 'test group name',
      sub_name: 'test group sub_name',
    });

    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('group');
    expect(ret).toHaveProperty('group.name', 'test group name');
    expect(ret).toHaveProperty('group.uuid');

    let groupUUID = ret.group.uuid;
    await GroupGroup.destroy({
      where: {
        uuid: groupUUID,
      },
      force: true,
    });
  });

  test('getInfo should be ok', async () => {
    let ret = await context.emitEvent('group::getInfo', {
      uuid: testGroup.uuid,
    });

    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('group');
    expect(ret).toHaveProperty('group.uuid', testGroup.uuid);
  });

  test('updateInfo should be ok', async () => {
    const name = generateRandomStr(30);
    const sub_name = generateRandomStr(30);
    const desc = generateRandomStr(30);
    const rule = generateRandomStr(30);
    let ret = await context.emitEvent('group::updateInfo', {
      groupUUID: testGroup.uuid,
      groupInfo: {
        name,
        sub_name,
        desc,
        rule,
      },
    });

    expect(ret.result).toBe(true);

    expect(ret).toHaveProperty('group');
    expect(ret).toHaveProperty('group.uuid', testGroup.uuid);
    expect(ret).toHaveProperty('group.name', name);
    expect(ret).toHaveProperty('group.sub_name', sub_name);
    expect(ret).toHaveProperty('group.desc', desc);
    expect(ret).toHaveProperty('group.rule', rule);
  });

  test.todo('findGroup should be ok');

  test('requestJoinGroup should be ok', async () => {
    const ret = await context.emitEvent('group::requestJoinGroup', {
      group_uuid: testGroup.uuid,
    });
    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('request');
    expect(ret.request.is_agree).toBe(false);
    expect(ret.request.is_refuse).toBe(false);
    expect(ret.request.group_uuid).toBe(testGroup.uuid);
    expect(ret.request.from_uuid).toBe(testUser.uuid);

    const groupRequestUUID = ret.request.uuid;
    const requestIns = await GroupRequest.findOne({
      where: {
        uuid: groupRequestUUID,
      },
    });
    expect(requestIns).toBeTruthy();
    await requestIns.destroy();
  });

  test.todo('agreeGroupRequest should be ok');

  test.todo('refuseGroupRequest should be ok');

  test.todo('sendGroupInvite should be ok');

  test.todo('refuseGroupInvite should be ok');

  test('agreeGroupInvite should be ok', async () => {
    const invite = await GroupInvite.create({
      group_uuid: testGroup.uuid,
      from_uuid: 'test_uuid',
      to_uuid: testUser.uuid,
    });

    const ret = await context.emitEvent('group::agreeGroupInvite', {
      uuid: invite.uuid,
    });
    expect(ret).toBeSuccess();
    expect(ret.result).toBe(true);
    expect(ret.res).toMatchObject({
      uuid: invite.uuid,
      is_agree: true,
      is_refuse: false,
    });
    expect(ret.res.group).toBeTruthy();
    expect(ret.res.group).toMatchObject({
      uuid: testGroup.uuid,
    });

    // 校验一下数据库
    const savedInvite = await GroupInvite.findOne({
      where: { uuid: invite.uuid },
    });
    expect(savedInvite.is_agree).toBe(true);
    expect(savedInvite.is_refuse).toBe(false);

    await invite.destroy(); // 销毁
  });

  test('getGroupInviteDetail should be ok', async () => {
    const invite = await GroupInvite.create({
      group_uuid: 'test',
      from_uuid: 'test_uuid',
      to_uuid: testUser.uuid,
    });

    const ret = await context.emitEvent('group::getGroupInviteDetail', {
      uuid: invite.uuid,
    });

    expect(ret).toBeTruthy();
    expect(ret.result).toBe(true);
    expect(ret.invite).toMatchObject({
      uuid: invite.uuid,
      group_uuid: invite.group_uuid,
      from_uuid: invite.from_uuid,
      to_uuid: invite.to_uuid,
      is_agree: false,
      is_refuse: false,
    });

    await invite.destroy();
  });

  test('getGroupInvite should be ok', async () => {
    let ret = await context.emitEvent('group::getGroupInvite');
    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('res');
    expect(Array.isArray(ret.res)).toBe(true);
  });

  test('getGroupList should be ok', async () => {
    let ret = await context.emitEvent('group::getGroupList');
    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('groups');
    expect(Array.isArray(ret.groups)).toBe(true);
  });

  test('getGroupMembers should be ok', async () => {
    let group = await GroupGroup.findOne();
    let ret = await context.emitEvent('group::getGroupMembers', {
      groupUUID: group.uuid,
    });

    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('members');
    expect(Array.isArray(ret.members)).toBe(true);
    if (ret.members.length > 0) {
      expect(ret).toHaveProperty('members.0.selected_actor_uuid');
    }
  });

  test('getGroupActors should be ok', async () => {
    let group = await GroupGroup.findOne();
    let ret = await context.emitEvent('group::getGroupActors', {
      groupUUID: group.uuid,
    });

    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('actors');
    expect(Array.isArray(ret.actors)).toBe(true);
    if (ret.actors.length > 0) {
      expect(ret).toHaveProperty('actors.0.actor');
    }
  });

  test('addGroupActor should be ok', async () => {
    const testActor = await createTestActor();
    const ret = await context.emitEvent('group::addGroupActor', {
      groupUUID: testGroup.uuid,
      actorUUID: testActor.uuid,
    });

    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('groupActor');
    expect(ret).toHaveProperty('groupActor.actorId');
    expect(ret).toHaveProperty('groupActor.groupId');

    await GroupActor.destroy({
      where: {
        uuid: ret.groupActor.uuid,
      },
    });

    await testActor.destroy();
  });

  test.todo('removeGroupActor should be ok');

  describe('group actor action', () => {
    let testActor: ActorActor;
    let testGroupActor: GroupActor;
    beforeAll(async () => {
      testActor = await createTestActor();
      testGroupActor = await GroupActor.create({
        actor_uuid: testActor.uuid,
        ownerId: testUser.id,
        actorId: testActor.id,
        groupId: testGroup.id,
      });
    });

    test.todo('agreeGroupActor should be ok');

    test.todo('refuseGroupActor should be ok');

    test('updateGroupActorInfo should be ok', async () => {
      const testGroupActor = await createTestGroupActor(
        testGroup.id,
        testActor.id
      );
      const targetActorInfo = { testInfo: 'aa' };

      const ret = await context.emitEvent('group::updateGroupActorInfo', {
        groupActorUUID: testGroupActor.uuid,
        groupActorInfo: targetActorInfo,
      });
      expect(ret).toBeSuccess();
      expect(ret.groupActor).toHaveProperty('actor_info');
      expect(ret.groupActor.actorId).toBe(testActor.id);
      expect(ret.groupActor.actor_info).toMatchObject(targetActorInfo);

      // 再检查数据库中是否确实写入了
      expect(
        await GroupActor.findOne({ where: { uuid: testGroupActor.uuid } })
      ).toMatchObject({
        actor_info: targetActorInfo,
      });

      await testGroupActor.destroy();
    });

    afterAll(async () => {
      await testActor.destroy();
      await testGroupActor.destroy();
    });

    test('setPlayerSelectedGroupActor should be ok', async () => {
      let ret = await context.emitEvent('group::setPlayerSelectedGroupActor', {
        groupUUID: testGroup.uuid,
        groupActorUUID: testGroupActor.uuid,
      });

      expect(ret.result).toBe(true);
      expect(ret).toHaveProperty('data');
      expect(ret).toHaveProperty('data.groupUUID', testGroup.uuid);
      expect(ret).toHaveProperty('data.groupActorUUID', testGroupActor.uuid);
    });

    test('getPlayerSelectedGroupActor should be ok', async () => {
      let ret = await context.emitEvent('group::getPlayerSelectedGroupActor', {
        groupUUID: testGroup.uuid,
        groupMemberUUID: testUser.uuid,
      });

      expect(ret.result).toBe(true);
      expect(ret).toHaveProperty('playerSelectedGroupActor');
      expect(ret).toHaveProperty(
        'playerSelectedGroupActor.groupMemberUUID',
        testUser.uuid
      );
    });
  });

  test.todo('quitGroup should be ok');

  test.todo('dismissGroup should be ok');

  test.todo('tickMember should be ok');

  test.todo('setMemberToManager should be ok');

  test('getGroupStatus should be ok', async () => {
    let ret = await context.emitEvent('group::getGroupStatus', {
      groupUUID: testGroup.uuid,
    });

    expect(ret.result).toBe(true);
    expect(ret.status).toBe(false);
  });

  test('setGroupStatus should be ok', async () => {
    let ret = await context.emitEvent('group::setGroupStatus', {
      groupUUID: testGroup.uuid,
      groupStatus: true,
    });

    expect(ret.result).toBe(true);
  });
});
