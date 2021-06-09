import { buildAppContext } from 'test/utils/app';
import {
  getTestUser,
  handleLogin,
  handleLogout,
} from 'packages/Player/test/example';
import _ from 'lodash';
import { ActorActor } from '../lib/models/actor';
import { ActorTemplate } from '../lib/models/template';
import { PlayerUser } from 'packages/Player/lib/models/user';
import { createTestActor, createTestGroupActor } from './example';
import { GroupGroup } from 'packages/Group/lib/models/group';
import { createTestGroup } from 'packages/Group/test/example';
import { GroupActor } from '../lib/models/group-actor';

const context = buildAppContext();

let testUser: PlayerUser = null;

beforeAll(async () => {
  testUser = await handleLogin(context);
});

afterAll(async () => {
  await handleLogout(context, testUser);
});

describe('template event', () => {
  let testTemplate;

  beforeAll(async () => {
    testTemplate = await ActorTemplate.create({
      name: 'test template ' + Math.random(),
      info: 'test info',
      creatorId: testUser.id,
    });
  });

  afterAll(async () => {
    await testTemplate.destroy({
      force: true,
    });
  });

  test('getTemplate all should be ok', async () => {
    let ret = await context.emitEvent('actor::getTemplate');
    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('templates');
    expect(Array.isArray(ret.templates)).toBe(true);
  });

  test('getTemplate specify should be ok', async () => {
    let ret = await context.emitEvent('actor::getTemplate', {
      uuid: testTemplate.uuid,
    });
    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('template');
    expect(ret.template.uuid).toBe(testTemplate.uuid);
  });

  test('getSuggestTemplate should be ok', async () => {
    const ret = await context.emitEvent('actor::getSuggestTemplate', {});
    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('templates');
    expect(Array.isArray(ret.templates)).toBe(true);
  });

  test('findTemplate should be ok', async () => {
    let ret = await context.emitEvent('actor::findTemplate', { name: '空白' });
    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('templates');
    expect(ret).toHaveProperty('templates.0.creator_name');
  });

  // NOTE: 已经被迁移到model层
  // test('updateTemplate should be ok', async () => {
  //   let randomText = 'modified ' + Math.random();
  //   let ret = await context.emitEvent('actor::updateTemplate', {
  //     uuid: testTemplate.uuid,
  //     name: randomText + 'name',
  //     desc: randomText + 'desc',
  //     avatar: randomText + 'avatar',
  //     info: randomText + 'info',
  //   });

  //   expect(ret.result).toBe(true);
  //   expect(ret).toHaveProperty('template');
  //   expect(ret).toHaveProperty('template.name', randomText + 'name');
  //   expect(ret).toHaveProperty('template.desc', randomText + 'desc');
  //   expect(ret).toHaveProperty('template.avatar', randomText + 'avatar');
  //   expect(ret).toHaveProperty('template.info', randomText + 'info');

  //   let dbInstance = await ActorTemplate.findOne({
  //     where: {
  //       uuid: testTemplate.uuid,
  //     },
  //   });
  //   expect(dbInstance).toHaveProperty('name', randomText + 'name');
  //   expect(dbInstance).toHaveProperty('desc', randomText + 'desc');
  //   expect(dbInstance).toHaveProperty('avatar', randomText + 'avatar');
  //   expect(dbInstance).toHaveProperty('info', randomText + 'info');
  // });

  // test('removeTemplate should be ok', async () => {
  //   let oldTemplate = await ActorTemplate.create({
  //     name: 'test ' + Math.random(),
  //     info: 'info',
  //     creatorId: testUser.id,
  //   });

  //   let ret = await context.emitEvent('actor::removeTemplate', {
  //     uuid: oldTemplate.uuid,
  //   });
  //   expect(ret.result).toBe(true);

  //   let newTemplate = await ActorTemplate.findOne({
  //     where: {
  //       uuid: oldTemplate.uuid,
  //     },
  //     paranoid: false, // 搜索包括已经被软删除的行
  //   });
  //   expect(newTemplate).toBeTruthy(); // 没有被硬删除
  //   expect(newTemplate.deletedAt).toBeTruthy(); // 已经被软删除

  //   // 把测试数据硬删除掉
  //   await newTemplate.destroy({ force: true });
  // });
});

describe('actor event', () => {
  let testActor: ActorActor;
  let testTemplate: ActorTemplate;

  beforeAll(async () => {
    testActor = await createTestActor();
    testTemplate = await ActorTemplate.findOne();
  });

  afterAll(async () => {
    await testActor.destroy();
  });

  test('createActor should be ok', async () => {
    let ret = await context.emitEvent('actor::createActor', {
      name: 'test actor',
      avatar: 'test avatar',
      desc: 'test desc',
      info: {
        string: 'test',
        number: 1,
        array: ['a', 'b', 'c'],
      },
      template_uuid: testTemplate.uuid,
    });
    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('actor');
    // TODO: 需要增加avatar绑定检测

    await ActorActor.destroy({
      where: {
        uuid: ret.actor.uuid,
      },
      force: true,
    });
  });

  test('getActor all should be ok', async () => {
    let ret = await context.emitEvent('actor::getActor');
    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('actors');
    expect(Array.isArray(ret.actors)).toBe(true);
  });

  test('getActor specify should be ok', async () => {
    let ret = await context.emitEvent('actor::getActor', {
      uuid: testActor.uuid,
    });
    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('actor');
    expect(ret).toHaveProperty('actor.uuid', testActor.uuid);
  });

  test('removeActor should be ok', async () => {
    const newTestActor = await ActorActor.create({
      name: 'test name',
      template_uuid: testTemplate.uuid,
      ownerId: testUser.id,
    });

    let ret = await context.emitEvent('actor::removeActor', {
      uuid: newTestActor.uuid,
    });

    expect(ret.result).toBe(true);

    await newTestActor.destroy({ force: true });
  });

  test.todo('updateActor should be ok');
});

describe('group actor', () => {
  let testGroup: GroupGroup;

  beforeAll(async () => {
    testGroup = await createTestGroup();
    const testUser = await getTestUser();
    await testGroup.addMember(testUser);
  });

  test('addGroupActor should be ok', async () => {
    const testActor = await createTestActor();
    const ret = await context.emitEvent('group::addGroupActor', {
      groupUUID: testGroup.uuid,
      actorUUID: testActor.uuid,
    });

    try {
      expect(ret.result).toBe(true);
    } finally {
      await GroupActor.destroy({
        where: {
          actorId: testActor.id,
        },
      });

      await testActor.destroy();
    }
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

      const selectedGroupActorUUID = await GroupActor.getSelectedGroupActorUUID(
        testGroup,
        testUser.uuid
      );
      expect(selectedGroupActorUUID).toBe(testGroupActor.uuid);
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

  test('getGroupActorInitData should be ok', async () => {
    const ret = await context.emitEvent('actor::getGroupActorInitData', {
      groupUUID: testGroup.uuid,
    });

    expect(ret).toBeSuccess();
    expect(ret).toHaveProperty('groupActors');
    expect(ret).toHaveProperty('groupActorsMapping');
  });
});
