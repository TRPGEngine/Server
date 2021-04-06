import { FileAvatar } from 'packages/File/lib/models/avatar';
import { getTestUser } from 'packages/Player/test/example';
import testExampleStack from 'test/utils/example';

export const createTestFileAvatar = async (): Promise<FileAvatar> => {
  const testUser = await getTestUser();

  const testFileAvatar = await FileAvatar.create({
    name: 'test',
    size: 100,
    type: 'actor',
    owner_uuid: testUser.uuid,
    ownerId: testUser.id,
  });

  testExampleStack.append(testFileAvatar);

  return testFileAvatar;
};
