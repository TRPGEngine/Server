const db = global.db;
const emitEvent = global.emitEvent;
const _ = global._;
const generateRandomStr = global.generateRandomStr;

export {};

beforeAll(async () => {
  const loginInfo = await emitEvent('player::login', {
    username: 'admin1',
    password: '21232f297a57a5a743894a0e4a801fc3',
  });
  expect(loginInfo.result).toBe(true);
  this.userInfo = loginInfo.info;
  this.userInfoInstance = await db.models.player_user.findOne({
    where: { uuid: this.userInfo.uuid },
  });
});

afterAll(async () => {
  let { uuid, token } = this.userInfo;
  await emitEvent('player::logout', { uuid, token });
});

describe('group action', () => {
  beforeAll(async () => {
    this.testGroup = await db.models.group_group.create({
      name: 'test name' + generateRandomStr(),
      sub_name: 'test sub_name' + generateRandomStr(),
      creator_uuid: this.userInfo.uuid,
      owner_uuid: this.userInfo.uuid,
    });
    await this.testGroup.addMember(this.userInfoInstance, {
      through: {
        selected_group_actor_uuid: 'test selected_group_actor_uuid',
      },
    });
  });

  afterAll(async () => {
    await this.testGroup.destroy({ force: true });
  });

  test('create should be ok', async () => {
    let ret = await emitEvent('group::create', {
      name: 'test group name',
      sub_name: 'test group sub_name',
    });

    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('group');
    expect(ret).toHaveProperty('group.name', 'test group name');
    expect(ret).toHaveProperty('group.uuid');

    let groupUUID = ret.group.uuid;
    await db.models.group_group.destroy({
      where: {
        uuid: groupUUID,
      },
      force: true,
    });
  });

  test('getInfo should be ok', async () => {
    let ret = await emitEvent('group::getInfo', {
      uuid: this.testGroup.uuid,
    });

    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('group');
    expect(ret).toHaveProperty('group.uuid', this.testGroup.uuid);
  });

  test('updateInfo should be ok', async () => {
    const desc = generateRandomStr(30);
    let ret = await emitEvent('group::updateInfo', {
      groupUUID: this.testGroup.uuid,
      groupInfo: {
        desc,
      },
    });

    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('group');
    expect(ret).toHaveProperty('group.uuid', this.testGroup.uuid);
    expect(ret).toHaveProperty('group.desc', desc);
  });

  test.todo('findGroup should be ok');

  test('requestJoinGroup should be ok', async () => {
    const ret = await emitEvent('group::requestJoinGroup', {
      group_uuid: this.testGroup.uuid,
    });
    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('request');
    expect(ret.request.is_agree).toBe(false);
    expect(ret.request.is_refuse).toBe(false);
    expect(ret.request.group_uuid).toBe(this.testGroup.uuid);
    expect(ret.request.from_uuid).toBe(this.userInfo.uuid);

    const groupRequestUUID = ret.request.uuid;
    const requestIns = await db.models.group_request.findOne({
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

  test.todo('agreeGroupInvite should be ok');

  test('getGroupInvite should be ok', async () => {
    let ret = await emitEvent('group::getGroupInvite');
    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('res');
    expect(Array.isArray(ret.res)).toBe(true);
  });

  test('getGroupList should be ok', async () => {
    let ret = await emitEvent('group::getGroupList');
    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('groups');
    expect(Array.isArray(ret.groups)).toBe(true);
  });

  test('getGroupMembers should be ok', async () => {
    let group = await db.models.group_group.findOne();
    let ret = await emitEvent('group::getGroupMembers', {
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
    let group = await db.models.group_group.findOne();
    let ret = await emitEvent('group::getGroupActors', {
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
    let testActor = await db.models.actor_actor.findOne();
    let ret = await emitEvent('group::addGroupActor', {
      groupUUID: this.testGroup.uuid,
      actorUUID: testActor.uuid,
    });

    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('groupActor');
    expect(ret).toHaveProperty('groupActor.actorId');
    expect(ret).toHaveProperty('groupActor.groupId');

    await db.models.group_actor.destroy({
      where: {
        uuid: ret.groupActor.uuid,
      },
    });
  });

  test.todo('removeGroupActor should be ok');

  test.todo('agreeGroupActor should be ok');

  test.todo('refuseGroupActor should be ok');

  test.todo('updateGroupActorInfo should be ok');

  describe('group actor action', () => {
    beforeAll(async () => {
      let actor = await db.models.actor_actor.findOne();
      this.testGroupActor = await db.models.group_actor.create({
        actor_uuid: actor.uuid,
        ownerId: this.userInfo.id,
        actorId: actor.id,
        groupId: this.testGroup.id,
      });
    });

    afterAll(async () => {
      await this.testGroupActor.destroy();
    });

    test('setPlayerSelectedGroupActor should be ok', async () => {
      let ret = await emitEvent('group::setPlayerSelectedGroupActor', {
        groupUUID: this.testGroup.uuid,
        groupActorUUID: this.testGroupActor.uuid,
      });

      expect(ret.result).toBe(true);
      expect(ret).toHaveProperty('data');
      expect(ret).toHaveProperty('data.groupUUID', this.testGroup.uuid);
      expect(ret).toHaveProperty(
        'data.groupActorUUID',
        this.testGroupActor.uuid
      );
    });

    test('getPlayerSelectedGroupActor should be ok', async () => {
      let ret = await emitEvent('group::getPlayerSelectedGroupActor', {
        groupUUID: this.testGroup.uuid,
        groupMemberUUID: this.userInfo.uuid,
      });

      expect(ret.result).toBe(true);
      expect(ret).toHaveProperty('playerSelectedGroupActor');
      expect(ret).toHaveProperty(
        'playerSelectedGroupActor.groupMemberUUID',
        this.userInfo.uuid
      );
    });
  });

  test.todo('quitGroup should be ok');

  test.todo('dismissGroup should be ok');

  test.todo('tickMember should be ok');

  test.todo('setMemberToManager should be ok');

  test('getGroupStatus should be ok', async () => {
    let ret = await emitEvent('group::getGroupStatus', {
      groupUUID: this.testGroup.uuid,
    });

    expect(ret.result).toBe(true);
    expect(ret.status).toBe(false);
  });

  test('setGroupStatus should be ok', async () => {
    let ret = await emitEvent('group::setGroupStatus', {
      groupUUID: this.testGroup.uuid,
      groupStatus: true,
    });

    expect(ret.result).toBe(true);
  });
});
