import { buildAppContext } from 'test/utils/app';
import { ActorTemplate } from '../lib/models/template';
import { createTestActor } from './example';
import { getTestUser, getOtherTestUser } from 'packages/Player/test/example';
import testExampleStack from 'test/utils/example';
import { ActorActor } from '../lib/models/actor';
import _ from 'lodash';

buildAppContext();

testExampleStack.regAfterAll();

describe('ActorTemplate', () => {
  test('ActorTemplate.getList should be ok', async () => {
    const templates = await ActorTemplate.getList();

    expect(templates.length).toBeGreaterThanOrEqual(1);
    expect(templates.length).toBeLessThanOrEqual(10); // 返回结果不能大于10(默认)

    for (const t of templates) {
      // 返回结果只能是公开的
      expect(t.is_public).toBe(true);
    }
  });

  test('ActorTemplate.getRecommendList should be ok', async () => {
    const templates = await ActorTemplate.getRecommendList();

    expect(templates.length).toBeGreaterThanOrEqual(1);
    for (const t of templates) {
      expect(t.is_public).toBe(true);
      expect(t.built_in).toBe(true);
    }
  });

  test('ActorTemplate.createTemplate should be ok', async () => {
    const testUser = await getTestUser();
    const testCase = {
      name: 'test name',
      desc: 'test desc',
      avatar: 'test avatar',
      layout: 'test layout',
    };
    const template = await ActorTemplate.createTemplate(
      testCase.name,
      testCase.desc,
      testCase.avatar,
      testCase.layout,
      testUser.uuid
    );

    try {
      expect(template).toMatchObject({
        ...testCase,
        creatorId: testUser.id,
      });

      await expect(
        (async () => {
          await ActorTemplate.createTemplate(
            testCase.name,
            testCase.desc,
            testCase.avatar,
            testCase.layout,
            testUser.uuid
          );
        })()
      ).rejects.toThrowError('该模板名字已存在');
    } finally {
      await ActorTemplate.destroy({
        where: {
          id: template.id,
        },
        force: true,
      });
    }
  });

  test.todo('ActorTemplate.upgradeTemplate should be ok');
});

describe('ActorActor', () => {
  test('ActorActor.remove should be ok', async () => {
    const testActor = await createTestActor();
    const testUser = await getTestUser();
    await ActorActor.remove(testActor.uuid, testUser.uuid);

    expect(
      await ActorActor.findOne({
        where: {
          uuid: testActor.uuid,
        },
      })
    ).toBeNull();
  });

  test('ActorActor.findSharedActor should be ok', async () => {
    const testActor = await createTestActor();
    // 不会搜到未分享的用户
    expect(
      _.map((await ActorActor.findSharedActor(null)).list, 'uuid').includes(
        testActor.uuid
      )
    ).toBe(false);

    testActor.shared = true;
    await testActor.save();

    // 会搜到已分享的用户
    expect(
      _.map((await ActorActor.findSharedActor(null)).list, 'uuid').includes(
        testActor.uuid
      )
    ).toBe(true);

    // 可以指定模板
    expect(
      _.map(
        (await ActorActor.findSharedActor(testActor.template_uuid)).list,
        'uuid'
      ).includes(testActor.uuid)
    ).toBe(true);
  });

  test('ActorActor.shareActor should be ok', async () => {
    const testUser = await getTestUser();
    const testActor = await createTestActor();
    await ActorActor.shareActor(testActor.uuid, testUser.uuid);
    expect(
      (await ActorActor.findOne({ where: { uuid: testActor.uuid } })).shared
    ).toBe(true);
  });

  test('ActorActor.unshareActor should be ok', async () => {
    const testUser = await getTestUser();
    const testActor = await createTestActor();
    testActor.shared = true;
    await testActor.save();
    await ActorActor.unshareActor(testActor.uuid, testUser.uuid);
    expect(
      (await ActorActor.findOne({ where: { uuid: testActor.uuid } })).shared
    ).toBe(false);
  });

  test('ActorActor.forkActor should be ok', async () => {
    const testUser = await getOtherTestUser('admin9');
    const testTargetActor = await createTestActor();
    testTargetActor.shared = true;
    await testTargetActor.save();

    const actor = await ActorActor.forkActor(
      testTargetActor.uuid,
      testUser.uuid
    );

    try {
      expect(actor.uuid).not.toBe(testTargetActor.uuid);
      expect(actor.name).toBe(testTargetActor.name);
      expect(actor.avatar).toBe(testTargetActor.avatar);
      expect(actor.desc).toBe(testTargetActor.desc);
      expect(actor.template_uuid).toBe(testTargetActor.template_uuid);
      expect(actor.info).toMatchObject(testTargetActor.info);
      expect((await actor.getOwner()).uuid).toBe(testUser.uuid);
    } finally {
      await actor.destroy({ force: true });
    }
  });
});
