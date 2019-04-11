const _ = require('lodash');
const md5 = require('../md5');
const db = global.db;
const emitEvent = global.emitEvent;

describe('account', () => {
  test('login should be ok', async () => {
    let ret = await emitEvent('player::login', {
      username: 'admin1',
      password: md5('admin'),
    });

    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('info');
    expect(ret.info.username).toBe('admin1');
  });

  test.todo('login should be error if username and password is error');

  test.todo('login with token should be ok');

  test.todo('register should be ok');

  test.todo('logout should be ok');
});

describe('user action', () => {
  let userInfo = {};
  let userInfoDbInstance = null;

  beforeAll(async () => {
    const loginInfo = await emitEvent('player::login', {
      username: 'admin1',
      password: md5('admin'),
    });
    expect(loginInfo.result).toBe(true);
    userInfo = loginInfo.info;

    userInfoDbInstance = await db.models.player_user.findOne({
      where: { uuid: userInfo.uuid },
    });
  });

  afterAll(async () => {
    await emitEvent('player::logout', {
      uuid: userInfo.uuid,
      token: userInfo.token,
    });

    userInfo = {};
    userInfoDbInstance = null;
  });

  test.todo('getInfo should be ok');

  test.todo('updateInfo should be ok');

  test.todo('changePassword should be ok');

  test.todo('findUser should be ok');

  test('addFriend should be ok', async () => {
    let testUser = await db.models.player_user.findOne({
      where: {
        username: 'admin5',
      },
    });
    expect(testUser).toBeTruthy();
    let targetUUID = testUser.uuid;

    let ret = await emitEvent('player::addFriend', {
      uuid: targetUUID,
    });
    expect(ret.result).toBe(true);

    // 查询数据库校验是否写入数据库
    let friends = await userInfoDbInstance.getFriend();
    expect(friends).toHaveProperty('length');

    let friendIndex = _.findIndex(friends, { uuid: targetUUID });
    expect(friendIndex).toBeGreaterThanOrEqual(0);
  });

  test('getFriends should be ok', async () => {
    let ret = await emitEvent('player::getFriends');

    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('list');
    ret.list.map((item) => {
      // 检测返回的好友列表不能带入敏感信息
      expect(item.token).toBeFalsy();
      expect(item.app_token).toBeFalsy();
    });
  });

  test('sendFriendInvite should be ok', async () => {
    let testUser = await db.models.player_user.findOne({
      where: {
        username: 'admin6',
      },
    });
    expect(testUser).toBeTruthy();

    let ret = await emitEvent('player::sendFriendInvite', {
      to: testUser.uuid,
    });
    expect(ret.result).toBe(true);
    const invite = ret.invite;

    let retDup = await emitEvent('player::sendFriendInvite', {
      to: testUser.uuid,
    });
    expect(retDup.result).toBe(false); // 应当不允许重复请求

    let inviteInstance = await db.models.player_invite.findOne({
      where: {
        uuid: invite.uuid,
      },
    });
    expect(inviteInstance).toBeTruthy();
    await inviteInstance.destroy(); // 移除生成的邀请实例
  });

  describe('friend invite action', () => {
    let inviteUUID = null;

    beforeEach(async () => {
      // 创建一个好友邀请
      let testUser = await db.models.player_user.findOne({
        where: {
          username: 'admin6',
        },
      });
      let invite = await db.models.player_invite.create({
        from_uuid: testUser.uuid,
        to_uuid: userInfo.uuid,
      });

      inviteUUID = invite.uuid;
      expect(inviteUUID).toBeTruthy();
    });

    afterEach(async () => {
      // 移除新建的邀请
      await db.models.player_invite.destroy({
        where: {
          uuid: inviteUUID,
        },
      });
      inviteUUID = null;
    });

    test('agree should be ok', async () => {
      let ret = await emitEvent('player::agreeFriendInvite', {
        uuid: inviteUUID,
      });
      expect(ret.result).toBe(true);

      let instance = await db.models.player_invite.findOne({
        where: {
          uuid: inviteUUID,
        },
      });
      expect(instance).toBeTruthy();
      expect(instance.is_agree).toBe(true);
      expect(instance.is_refuse).toBe(false);
    });

    test('refuse should be ok', async () => {
      let ret = await emitEvent('player::refuseFriendInvite', {
        uuid: inviteUUID,
      });
      expect(ret.result).toBe(true);

      let instance = await db.models.player_invite.findOne({
        where: {
          uuid: inviteUUID,
        },
      });
      expect(instance).toBeTruthy();
      expect(instance.is_agree).toBe(false);
      expect(instance.is_refuse).toBe(true);
    });

    test('get invite should be ok', async () => {
      let ret = await emitEvent('player::getFriendsInvite');
      expect(ret.result).toBe(true);

      expect(ret.res).toHaveProperty('length');
      let index = _.findIndex(ret.res, {
        uuid: inviteUUID,
      });
      expect(index).toBeGreaterThanOrEqual(0);
    });
  });

  test('check user online should be ok', async () => {
    let selfRet = await emitEvent('player::checkUserOnline', {
      uuid: userInfo.uuid,
    });

    expect(selfRet.result).toBe(true);
    expect(selfRet.isOnline).toBe(true);

    let errRet = await emitEvent('player::checkUserOnline', {
      uuid: Math.random(),
    });

    expect(errRet.result).toBe(true);
    expect(errRet.isOnline).toBe(false);
  });

  test('get settings should be ok', async () => {
    let ret = await emitEvent('player::getSettings');
    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('userSettings');
    expect(ret).toHaveProperty('systemSettings');
  });

  test.todo('save settings should be ok');
});
