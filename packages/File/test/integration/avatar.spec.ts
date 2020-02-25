import { buildAppContext } from 'test/utils/app';
import path from 'path';
import { getTestUser } from 'packages/Player/test/example';
import { createTestActor } from 'packages/Actor/test/example';
import testExampleStack from 'test/utils/example';
import { FileAvatar } from 'packages/File/lib/models/avatar';
import { Op } from 'trpg/core';

const context = buildAppContext();

testExampleStack.regAfterAll();

describe('avatar router', () => {
  it('/file/avatar', async () => {
    const testUser = await getTestUser();
    const testActor = await createTestActor();
    const file = path.resolve(__dirname, '../example/example-image.png');
    const header = {
      'user-uuid': testUser.uuid,
      'avatar-type': 'actor',
      'attach-uuid': testActor.uuid,
    };
    const { body } = await context.request.upload(
      '/file/avatar',
      [
        {
          name: 'avatar',
          file,
        },
      ],
      header
    );

    expect(body).toBeSuccess();
    expect(body).toHaveProperty('uuid');
    expect(body).toHaveProperty('url');
    expect(body).toHaveProperty('avatar');
    expect(body).toHaveProperty('filename');
    const firstAvatarUUID = body.uuid;

    // 再次上传会将上一次的绑定的uuid置空
    const { body: body2 } = await context.request.upload(
      '/file/avatar',
      [
        {
          name: 'avatar',
          file,
        },
      ],
      header
    );
    expect(body2.uuid).not.toEqual(firstAvatarUUID); // 两次上传同样文件, 应该生成两条记录
    expect(body2.filename).toEqual(body.filename); // 两次上传同样文件, 文件名应相等

    const firstAvatar = await FileAvatar.findOne({
      where: {
        uuid: firstAvatarUUID,
      },
    });
    expect(firstAvatar.attach_uuid).toBeNull(); // 旧的记录的attach_uuid应当被置空

    // 测试完成后应当删除记录(不用删除文件因为文件是同名文件无所谓)
    await FileAvatar.destroy({
      force: true,
      where: {
        uuid: {
          [Op.in]: [firstAvatarUUID, body2.uuid],
        },
      },
    });
  });
});

describe('avatar router v2', () => {
  it('/file/v2/avatar/', async () => {
    const testUser = await getTestUser();
    const testActor = await createTestActor();
    const file = path.resolve(__dirname, '../example/example-image.png');
    const header = {
      'user-uuid': testUser.uuid,
      'avatar-type': 'actor',
      'attach-uuid': testActor.uuid,
    };
    const { body } = await context.request.upload(
      '/file/v2/avatar/upload',
      [
        {
          name: 'avatar',
          file,
        },
      ],
      header
    );

    expect(body).toHaveProperty('url');
    expect(body).toHaveProperty('isLocal');
  });
});
