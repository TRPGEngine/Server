import { GroupGroup as GroupGroupCls } from '../lib/models/group';
import { GroupActor as GroupActorCls } from '../lib/models/actor';
import _ from 'lodash';

const db = global.db;
const GroupGroup: typeof GroupGroupCls = db.models.group_group;
const GroupActor: typeof GroupActorCls = db.models.group_actor;

export {};

describe('group model', () => {
  describe('group', () => {
    let testGroup: GroupGroupCls;
    let testGroupActor: GroupActorCls;

    beforeAll(async () => {
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
      await _.invoke(testGroup, 'destroy');
      await _.invoke(testGroupActor, 'destroy');
    });

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
});
