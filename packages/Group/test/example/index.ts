import { GroupGroup } from 'packages/Group/lib/models/group';
import { GroupActor } from 'packages/Group/lib/models/actor';
import _ from 'lodash';
import { getTestUser } from 'packages/Player/test/example';
import testExampleStack from 'test/utils/example';
import { generateRandomStr } from 'test/utils/utils';
import { GroupDetail } from 'packages/Group/lib/models/detail';
import { GroupPanel } from 'packages/Group/lib/models/panel';

export const createTestGroup = async (): Promise<GroupGroup> => {
  const testUser = await getTestUser();
  const group: GroupGroup = await GroupGroup.create({
    type: 'test',
    name: 'test_group' + generateRandomStr(4),
    desc: generateRandomStr(),
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
export const testGroupActorInfo = { a: '1', b: '2' };
export const createTestGroupActor = async (
  groupId?: number,
  actorId?: number
): Promise<GroupActor> => {
  if (!_.isNumber(groupId)) {
    const group = await createTestGroup();
    groupId = group.id;
  }

  const testUser = await getTestUser();

  const groupActor: GroupActor = await GroupActor.create({
    actor_uuid: 'test_actor',
    actor_info: testGroupActorInfo,
    name: 'test',
    groupId,
    actorId,
    ownerId: testUser.id,
  });

  testExampleStack.append(groupActor);

  return groupActor;
};

export const createTestGroupDetail = async (groupId: number) => {
  const groupDetail: GroupDetail = await GroupDetail.create({
    groupId,
  });

  testExampleStack.append(groupDetail);

  return groupDetail;
};

export const createTestGroupPanel = async (
  groupId: number,
  attrs: object
): Promise<GroupPanel> => {
  const groupPanel = await GroupPanel.create({
    name: generateRandomStr(),
    type: 'test',
    ...attrs,
    groupId,
  });

  testExampleStack.append(groupPanel);

  return groupPanel;
};
