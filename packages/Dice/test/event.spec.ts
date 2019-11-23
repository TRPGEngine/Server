import { buildAppContext } from 'test/utils/app';
import { handleLogin, handleLogout } from 'packages/Player/test/example';
import { PlayerUser } from 'packages/Player/lib/models/user';

const context = buildAppContext();

let testUser: PlayerUser;

beforeAll(async () => {
  testUser = await handleLogin(context);
});

afterAll(async () => {
  await handleLogout(context, testUser);
});

describe('basic action', () => {
  test('roll should be ok', async () => {
    let ret = await context.emitEvent('dice::roll', {
      sender_uuid: testUser.uuid,
      to_uuid: testUser.uuid,
      is_group: false,
      dice_request: '1d100',
    });

    expect(ret.result).toBe(true);
  });

  test('sendDiceRequest should be ok', async () => {
    let ret = await context.emitEvent('dice::sendDiceRequest', {
      to_uuid: testUser.uuid,
      is_group: false,
      dice_request: '1d100',
      reason: 'test',
    });

    expect(ret).toBeSuccess();
    expect(ret).toHaveProperty('pkg');
  });

  test.todo('acceptDiceRequest should be ok');

  test.todo('sendDiceInvite should be ok');

  test.todo('acceptDiceInvite should be ok');

  test.todo('sendQuickDice should be ok');
});
