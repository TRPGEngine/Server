import { GroupGroup } from 'packages/Group/lib/models/group';
import { GroupActor } from 'packages/Group/lib/models/actor';
import _ from 'lodash';
import { getTestUser } from 'packages/Player/test/example';
import testExampleStack from 'test/utils/example';

export const createTestGroup = async (): Promise<GroupGroup> => {
  const testUser = await getTestUser();
  const group: GroupGroup = await GroupGroup.create({
    type: 'test',
    name: 'test_group',
    creator_uuid: testUser.uuid,
    owner_uuid: testUser.uuid,
  });

  testExampleStack.append(group);

  return group;
};

/**
 * 如果没有给团ID， 则创建一个新的团作为该团人物卡的所在团
 * @param groupId 团ID
 */
export const createTestGroupActor = async (
  groupId?: number,
  actorId?: number
): Promise<GroupActor> => {
  if (!_.isNumber(groupId)) {
    const group = await createTestGroup();
    groupId = group.id;
  }

  const groupActor: GroupActor = await GroupActor.create({
    actor_uuid: 'test_actor',
    actor_info: {},
    name: 'test',
    groupId,
    actorId,
  });

  testExampleStack.append(groupActor);

  return groupActor;
};
