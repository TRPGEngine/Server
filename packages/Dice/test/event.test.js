const db = global.db;
const emitEvent = global.emitEvent;

beforeAll(async () => {
  const loginInfo = await emitEvent('player::login', {
    username: 'admin1',
    password: '21232f297a57a5a743894a0e4a801fc3'
  })
  expect(loginInfo.result).toBe(true);
  this.userInfo = loginInfo.info;
  this.userInfoInstance = await db.models.player_user.findOne({
    where: {uuid: this.userInfo.uuid}
  })
})

afterAll(async () => {
  let {
    uuid,
    token
  } = this.userInfo;
  await emitEvent('player::logout', { uuid, token })
})

describe('basic action', () => {
  test('roll should be ok', async () => {
    let ret = await emitEvent('dice::roll', {
      sender_uuid: this.userInfo.uuid,
      to_uuid: this.userInfo.uuid,
      is_group: false,
      dice_request: '1d100',
    })

    expect(ret.result).toBe(true);
  });

  test('sendDiceRequest should be ok', async () => {
    let ret = await emitEvent('dice::sendDiceRequest', {
      to_uuid: this.userInfo.uuid,
      is_group: false,
      dice_request: '1d100',
      reason: 'test',
    })

    expect(ret).toBeSuccess();
    expect(ret).toHaveProperty('pkg');
  });

  test.todo('acceptDiceRequest should be ok');

  test.todo('sendDiceInvite should be ok');

  test.todo('acceptDiceInvite should be ok');

  test.todo('sendQuickDice should be ok');
})
