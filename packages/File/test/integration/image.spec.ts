import { buildAppContext } from 'test/utils/app';
import path from 'path';
import { genTestPlayerJWT, getTestUser } from 'packages/Player/test/example';
import testExampleStack from 'test/utils/example';

const context = buildAppContext();

testExampleStack.regAfterAll();

describe('image router v2', () => {
  test('/file/v2/image/', async () => {
    const jwt = await genTestPlayerJWT();
    const file = path.resolve(__dirname, '../example/example-image.png');
    const header = {
      'X-Token': jwt,
      usage: 'test',
      'attach-uuid': '',
    };
    const { body } = await context.request.upload(
      '/file/v2/image/upload',
      [
        {
          name: 'image',
          file,
        },
      ],
      header
    );

    expect(body).toHaveProperty('url');
    expect(body).toHaveProperty('isLocal');
    expect(body).toHaveProperty('uuid');
  });
});
