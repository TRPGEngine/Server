import { GroupGroup } from 'packages/Group/lib/models/group';
import { GroupActor } from 'packages/Group/lib/models/actor';
import _ from 'lodash';
import { getTestUser } from 'packages/Player/test/example';
import testExampleStack from 'test/utils/example';
import { generateRandomStr } from 'test/utils/utils';
import { GroupDetail } from 'packages/Group/lib/models/detail';
import { GroupPanel } from 'packages/Group/lib/models/panel';
import { GroupInvite } from 'packages/Group/lib/models/invite';
import { PartialModelField } from 'trpg/core';

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

export const createTestGroupDetail = async (groupId: number) => {
  const groupDetail: GroupDetail = await GroupDetail.create({
    groupId,
  });

  testExampleStack.append(groupDetail);

  return groupDetail;
};

export const createTestGroupPanel = async (
  groupId: number,
  attrs?: object
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

export async function createTestGroupInvite(
  to_uuid: string,
  others: PartialModelField<GroupInvite> = {}
): Promise<GroupInvite> {
  const testUser = await getTestUser();
  const testGroup = await createTestGroup();
  const invite = await GroupInvite.create({
    group_uuid: testGroup.uuid,
    from_uuid: testUser.uuid,
    to_uuid,
    is_agree: false,
    is_refuse: false,
    ...others,
  });

  testExampleStack.append(invite);

  return invite;
}
