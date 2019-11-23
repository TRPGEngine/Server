import { buildAppContext } from 'test/utils/app';
import { handleLogin, handleLogout } from 'packages/Player/test/example';

const context = buildAppContext();

let testUser;

beforeAll(async () => {
  testUser = await handleLogin(context);
});

afterAll(async () => {
  await handleLogout(context, testUser);
});

describe('chat emotion event', () => {
  test('getUserEmotionCatalog should be ok', async () => {
    const ret = await context.emitEvent('chatemotion::getUserEmotionCatalog');

    expect(ret.result).toBe(true);
    expect(ret.catalogs).toBeTruthy();
    expect(Array.isArray(ret.catalogs)).toBe(true);
  });
});
