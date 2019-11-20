import { ActorActor as ActorActorCls } from 'packages/Actor/lib/models/actor';
import { ActorTemplate as ActorTemplateCls } from 'packages/Actor/lib/models/template';
import { GroupGroup as GroupGroupCls } from '../lib/models/group';
import { GroupActor as GroupActorCls } from '../lib/models/actor';
import _ from 'lodash';

const db = global.db;
const ActorActor: typeof ActorActorCls = db.models.actor_actor;
const ActorTemplate: typeof ActorTemplateCls = db.models.actor_template;
const GroupGroup: typeof GroupGroupCls = db.models.group_group;
const GroupActor: typeof GroupActorCls = db.models.group_actor;

export {};

describe('model function', () => {
  let testActor: ActorActorCls;
  let testGroup: GroupGroupCls;
  let testGroupActor: GroupActorCls;

  beforeAll(async () => {
    const firstTemplate = await ActorTemplate.findOne();
    testActor = await ActorActor.create({
      name: 'test actor name',
      desc: '',
      avatar: '',
      template_uuid: firstTemplate.uuid,
    });

    testGroup = await GroupGroup.create({
      type: 'test',
      name: 'test_group',
      creator_uuid: 'test_uuid',
      owner_uuid: 'test_uuid',
    });

    testGroupActor = await GroupActor.create({
      actor_uuid: 'test_actor',
      actor_info: {},
      name: 'test',
      groupId: testGroup.id,
    });
  });

  afterAll(async () => {
    await _.invoke(testActor, 'destroy');
    await _.invoke(testGroup, 'destroy');
    await _.invoke(testGroupActor, 'destroy');
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
    test('GroupActor.addApprovalGroupActor should be ok', async () => {
      const firstUser = await db.models.player_user.findOne();
      const groupActor = await GroupActor.addApprovalGroupActor(
        testGroup.uuid,
        testActor.uuid,
        firstUser.uuid
      );

      expect(groupActor.toJSON()).toHaveProperty('actor');
      expect(groupActor.toJSON()).toHaveProperty('group');

      // 角色信息复制
      expect(groupActor.name).toBe(testActor.name);
      expect(groupActor.desc).toBe(testActor.desc);
      expect(groupActor.avatar).toBe(testActor.avatar);

      await groupActor.destroy();
    });
  });
});
