import { buildAppContext } from 'test/utils/app';
import { handleLogin, handleLogout } from './example';
import { PlayerUser } from '../lib/models/user';
import { sleep } from 'lib/helper/utils';

const context = buildAppContext();

describe('simple test', () => {
  test('handleLogin should be ok', async () => {
    const testUser = await handleLogin(context);

    expect(testUser instanceof PlayerUser).toBe(true);

    await handleLogout(context, testUser);

    await sleep(500);
  });
});
