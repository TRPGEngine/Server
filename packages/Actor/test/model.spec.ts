import { buildAppContext } from 'test/utils/app';
import { ActorTemplate } from '../lib/models/template';
import { createTestActor, createTestGroupActor, testGroupActorInfo } from './example';
import { getTestUser, getOtherTestUser } from 'packages/Player/test/example';
import testExampleStack from 'test/utils/example';
import { ActorActor } from '../lib/models/actor';
import { GroupActor } from '../lib/models/group-actor';
import _ from 'lodash';
import { createTestGroup } from 'packages/Group/test/example';
import { GroupGroup } from 'packages/Group/lib/models/group';
import { PlayerUser } from 'packages/Player/lib/models/user';

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

describe('GroupActor', () => {
  let testActor: ActorActor;
  let testGroup: GroupGroup;
  let testGroupActor: GroupActor;

  beforeEach(async () => {
    testActor = await createTestActor();
    testGroup = await createTestGroup();
    testGroupActor = await createTestGroupActor(testGroup.id);
  });

  afterEach(async () => {
    testGroup = null;
    testGroupActor = null;
  });

  test('GroupActor.findGroupActorsByUUID should be ok', async () => {
    const actors = await GroupActor.findGroupActorsByUUID(testGroup.uuid);

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
    expect(typeof checkedActor.owner.uuid).toBe('string');
    expect(checkedActor.owner.uuid).toBe(
      (await testGroupActor.getOwner()).uuid
    );
    expect(checkedActor.owner.password).toBeUndefined();
    expect(checkedActor.owner.token).toBeUndefined();
    expect(checkedActor.owner.app_token).toBeUndefined();
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
    const groupActorData: any = await GroupActor.addApprovalGroupActor(
      testGroup.uuid,
      testActor.uuid,
      testUser.uuid
    );

    try {
      expect(groupActorData).toHaveProperty('id');
      expect(groupActorData).toHaveProperty('actor');

      // 角色信息复制
      expect(groupActorData.name).toBe(testActor.name);
      expect(groupActorData.desc).toBe(testActor.desc);
      expect(groupActorData.avatar).toBe(testActor.avatar);
    } finally {
      await GroupActor.destroy({
        where: { id: groupActorData.id },
      });
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

  describe('GroupActor.assignGroupActor should be ok', () => {
    test('with new actor', async () => {
      const testGroup = await createTestGroup();
      const testUser = await getTestUser();
      const testUser9 = await getOtherTestUser('admin9');
      await testGroup.addMembers([testUser, testUser9]);
      const testGroupActor = await createTestGroupActor(testGroup.id);
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

    test('with selected actor', async () => {
      const testGroup = await createTestGroup();
      const testUser = await getTestUser();
      const testUser8 = await getOtherTestUser('admin8');
      await testGroup.addMembers([testUser, testUser8]);
      const testGroupActor = await createTestGroupActor(testGroup.id);
      testGroupActor.passed = true;
      await testGroupActor.save();
      await GroupActor.setPlayerSelectedGroupActor(
        testGroup.uuid,
        testGroupActor.uuid,
        testUser.uuid,
        testUser.uuid
      );
      expect(
        await GroupActor.getSelectedGroupActorUUID(testGroup, testUser.uuid)
      ).toBe(testGroupActor.uuid); // 期望数据库中已写入选择角色

      await GroupActor.assignGroupActor(
        testGroup.uuid,
        testGroupActor.uuid,
        testUser.uuid,
        testUser8.uuid
      );

      const groupActor: GroupActor = await GroupActor.findOne({
        where: {
          uuid: testGroupActor.uuid,
        },
      });
      // 新所有者已被分配
      const owner: PlayerUser = await groupActor.getOwner();
      expect(owner.uuid).toBe(testUser8.uuid);

      // 旧所有者当前选择清空
      const selectedUUID = await GroupActor.getSelectedGroupActorUUID(
        testGroup,
        testUser.uuid
      );
      expect(selectedUUID).toBe(null);
    });
  });

  test('GroupActor.getGroupActorDataFromConverse should be ok', async () => {
    // 准备数据
    const testUser = await getTestUser();
    const testGroup = await createTestGroup();
    const testActor = await createTestActor();
    const testGroupActor = await createTestGroupActor(
      testGroup.id,
      testActor.id
    );

    try {
      await testGroup.addMember(testUser, {
        through: { selected_group_actor_uuid: testGroupActor.uuid },
      });

      const members = await testGroup.getMembers();
      expect(
        _.get(members, [0, 'group_group_members', 'selected_group_actor_uuid'])
      ).toBe(testGroupActor.uuid);

      const data = await GroupActor.getGroupActorDataFromConverse(
        testGroup.uuid,
        testUser.uuid
      );
      expect(data).toMatchObject(testGroupActorInfo);
    } finally {
      await testGroup.destroy({ force: true });
      await testActor.destroy({ force: true });
      await testGroupActor.destroy({ force: true });
    }
  });
});
