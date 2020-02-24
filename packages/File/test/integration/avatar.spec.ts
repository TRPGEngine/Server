import { buildAppContext } from 'test/utils/app';
import path from 'path';
import { getTestUser } from 'packages/Player/test/example';
import { createTestActor } from 'packages/Actor/test/example';
import testExampleStack from 'test/utils/example';

const context = buildAppContext();

testExampleStack.regAfterAll();

describe('chatimg router', () => {
  it('/file/avatar', async () => {
    const testUser = await getTestUser();
    const testActor = await createTestActor();
    const { body } = await context.request.upload(
      '/file/avatar',
      [
        {
          name: 'avatar',
          file: path.resolve(__dirname, '../example/example-image.png'),
        },
      ],
      {
        'user-uuid': testUser.uuid,
        'avatar-type': 'actor',
        'attach-uuid': testActor.uuid,
      }
    );

    expect(body).toBeSuccess();
    expect(body).toHaveProperty('uuid');
    expect(body).toHaveProperty('url');
    expect(body).toHaveProperty('avatar');
  });
});
