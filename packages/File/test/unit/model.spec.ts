import { buildAppContext } from 'test/utils/app';
import { createTestFileAvatar } from '../example';
import { FileAvatar } from 'packages/File/lib/models/avatar';
import { getTestUser } from 'packages/Player/test/example';
import { PlayerUser } from 'packages/Player/lib/models/user';
import _ from 'lodash';

const context = buildAppContext();

describe('FileAvatar', () => {
  describe('FileAvatar.bindAttachUUID should be ok', () => {
    const testAttachUUID = 'test_attach_uuid';
    let testUser: PlayerUser;
    let testFileAvatar: FileAvatar;
    beforeAll(async () => {
      testUser = await getTestUser();
    });

    beforeEach(async () => {
      testFileAvatar = await createTestFileAvatar();
    });

    afterEach(async () => {
      await _.invoke(testFileAvatar, 'destroy');
      testFileAvatar = null;
    });

    test('FileAvatar.bindAttachUUID should be set attach_uuid', async () => {
      await FileAvatar.bindAttachUUID(
        testFileAvatar.uuid,
        testAttachUUID,
        testUser.uuid
      );

      const fa: FileAvatar = await FileAvatar.findOne({
        where: { uuid: testFileAvatar.uuid },
      });
      expect(fa).toBeTruthy();
      expect(fa.uuid).toBe(testFileAvatar.uuid);
      expect(fa.attach_uuid).toBe(testAttachUUID);
    });

    test('FileAvatar.bindAttachUUID should be unset old attach_uuid', async () => {
      await FileAvatar.bindAttachUUID(
        testFileAvatar.uuid,
        testAttachUUID,
        testUser.uuid
      );

      const testFileAvatar2 = await createTestFileAvatar();
      await FileAvatar.bindAttachUUID(
        testFileAvatar2.uuid,
        testAttachUUID,
        testUser.uuid
      );

      // 旧的attach_uuid会被清空
      const fa: FileAvatar = await FileAvatar.findOne({
        where: { uuid: testFileAvatar.uuid },
      });
      expect(fa).toBeTruthy();
      expect(fa.uuid).toBe(testFileAvatar.uuid);
      expect(fa.attach_uuid).toBe(null);

      // 新的attach_uuid会被设置
      const fa2: FileAvatar = await FileAvatar.findOne({
        where: { uuid: testFileAvatar2.uuid },
      });
      expect(fa2).toBeTruthy();
      expect(fa2.uuid).toBe(testFileAvatar2.uuid);
      expect(fa2.attach_uuid).toBe(testAttachUUID);

      await testFileAvatar2.destroy();
    });
  });
});
