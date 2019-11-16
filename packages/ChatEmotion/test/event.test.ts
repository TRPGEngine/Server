const db = global.db;
const emitEvent = global.emitEvent;
const _ = global._;

export {};

let userInfo;
let userInfoInstance;

beforeAll(async () => {
  const loginInfo = await emitEvent('player::login', {
    username: 'admin10',
    password: '21232f297a57a5a743894a0e4a801fc3',
  });
  expect(loginInfo.result).toBe(true);
  userInfo = loginInfo.info;
  userInfoInstance = await db.models.player_user.findOne({
    where: { uuid: userInfo.uuid },
  });
});

afterAll(async () => {
  let { uuid, token } = userInfo;
  await emitEvent('player::logout', { uuid, token });
});

describe('chat emotion event', () => {
  test('getUserEmotionCatalog should be ok', async () => {
    const ret = await emitEvent('chatemotion::getUserEmotionCatalog');

    expect(ret.result).toBe(true);
    expect(ret.catalogs).toBeTruthy();
    expect(Array.isArray(ret.catalogs)).toBe(true);
  });
});
