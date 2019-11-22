import { GroupGroup } from 'packages/Group/lib/models/group';

export const createTestGroup = async (): Promise<GroupGroup> => {
  const group: GroupGroup = await GroupGroup.create({
    type: 'test',
    name: 'test_group',
    creator_uuid: 'test_uuid',
    owner_uuid: 'test_uuid',
  });

  return group;
};
