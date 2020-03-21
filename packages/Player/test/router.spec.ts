import testExampleStack from 'test/utils/example';
import { buildAppContext } from 'test/utils/app';
import { getTestUser } from './example';

const context = buildAppContext();
testExampleStack.regAfterAll();

describe('Player router', () => {
  test('get /player/info/:uuid should be ok', async () => {
    const testUser = await getTestUser();
    const { status, body } = await context.request.get(
      `/player/info/${testUser.uuid}`
    );

    expect(status).toBe(200);
    expect(body).toHaveProperty('user');
    expect(body.user).not.toHaveProperty('password');
    expect(body.user).not.toHaveProperty('salt');
    expect(body.user).not.toHaveProperty('token');
    expect(body.user).not.toHaveProperty('app_token');
    expect(body.user).not.toHaveProperty('last_ip');
  });
});
