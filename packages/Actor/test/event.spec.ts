import { buildAppContext } from 'test/utils/app';
import { handleLogin, handleLogout } from 'packages/Player/test/example';
import _ from 'lodash';
import { ActorActor } from '../lib/models/actor';
import { ActorTemplate } from '../lib/models/template';
import { PlayerUser } from 'packages/Player/lib/models/user';

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
    let ret = await context.emitEvent('actor::findTemplate', { name: '刀' });
    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('templates');
    expect(ret).toHaveProperty('templates.0.creator_name');
  });

  test('createTemplate should be ok', async () => {
    let ret = await context.emitEvent('actor::createTemplate', {
      name: 'test template ' + Math.random(),
      info: JSON.stringify({
        test: 'abc',
        number: 2,
      }),
    });

    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('template');
    expect(ret).toHaveProperty('template.creatorId');

    let uuid = _.get(ret, 'template.uuid');
    let dnum = await ActorTemplate.destroy({
      where: { uuid },
      force: true, // 硬删除，默认是软删除
    });
    expect(dnum).toBeTruthy(); // 删除行数必须大于0
  });

  test('updateTemplate should be ok', async () => {
    let randomText = 'modified ' + Math.random();
    let ret = await context.emitEvent('actor::updateTemplate', {
      uuid: testTemplate.uuid,
      name: randomText + 'name',
      desc: randomText + 'desc',
      avatar: randomText + 'avatar',
      info: randomText + 'info',
    });

    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('template');
    expect(ret).toHaveProperty('template.name', randomText + 'name');
    expect(ret).toHaveProperty('template.desc', randomText + 'desc');
    expect(ret).toHaveProperty('template.avatar', randomText + 'avatar');
    expect(ret).toHaveProperty('template.info', randomText + 'info');

    let dbInstance = await ActorTemplate.findOne({
      where: {
        uuid: testTemplate.uuid,
      },
    });
    expect(dbInstance).toHaveProperty('name', randomText + 'name');
    expect(dbInstance).toHaveProperty('desc', randomText + 'desc');
    expect(dbInstance).toHaveProperty('avatar', randomText + 'avatar');
    expect(dbInstance).toHaveProperty('info', randomText + 'info');
  });

  test('removeTemplate should be ok', async () => {
    let oldTemplate = await ActorTemplate.create({
      name: 'test ' + Math.random(),
      info: 'info',
      creatorId: testUser.id,
    });

    let ret = await context.emitEvent('actor::removeTemplate', {
      uuid: oldTemplate.uuid,
    });
    expect(ret.result).toBe(true);

    let newTemplate = await ActorTemplate.findOne({
      where: {
        uuid: oldTemplate.uuid,
      },
      paranoid: false, // 搜索包括已经被软删除的行
    });
    expect(newTemplate).toBeTruthy(); // 没有被硬删除
    expect(newTemplate.deletedAt).toBeTruthy(); // 已经被软删除

    // 把测试数据硬删除掉
    await newTemplate.destroy({ force: true });
  });
});

describe('actor event', () => {
  let testTemplate;
  let testActor;

  beforeAll(async () => {
    testTemplate = await ActorTemplate.findOne();
    testActor = await ActorActor.findOne();
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
