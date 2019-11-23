import { buildAppContext } from 'test/utils/app';
import { testUserInfo, handleLogin, handleLogout } from './example';
import { PlayerUser } from '../lib/models/user';
import _ from 'lodash';
import { PlayerInvite } from '../lib/models/invite';
import { sleep } from 'test/utils/utils';

const context = buildAppContext();

// TODO: 有一些蜜汁原因导致其不能同时执行，需要找时间看一下。 目前先跳过
describe.skip('account', () => {
  test('login and logout should be ok', async () => {
    const ret = await context.emitEvent('player::login', {
      username: 'admin9',
      password: testUserInfo.password,
    });

    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('info');
    expect(typeof ret.info.uuid).toBe('string');
    expect(ret.info.username).toBe('admin9');

    // 登录完毕后退出登录
    await sleep(500); // 因为刚登录时数据还没有写入数据库，因此等待100毫秒让token写入数据库
    const logoutRet = await context.emitEvent('player::logout', {
      uuid: ret.info.uuid,
      token: ret.info.token,
    });

    expect(logoutRet.result).toBe(true);
  });

  test.todo('login should be error if username and password is error');

  test.todo('login with token should be ok');

  test.todo('register should be ok');

  test.todo('logout should be ok');
});

describe('user action', () => {
  let testUser: PlayerUser;

  beforeAll(async () => {
    testUser = await handleLogin(context);
  });

  afterAll(async () => {
    await handleLogout(context, testUser);
    testUser = null;
  });

  test.todo('getInfo should be ok');

  test.todo('updateInfo should be ok');

  test.todo('changePassword should be ok');

  test.todo('findUser should be ok');

  // test('addFriend should be ok', async () => {
  //   let testUser = await context.db.models.player_user.findOne({
  //     where: {
  //       username: 'admin5',
  //     },
  //   });
  //   expect(testUser).toBeTruthy();
  //   let targetUUID = testUser.uuid;

  //   let ret = await context.emitEvent('player::addFriend', {
  //     uuid: targetUUID,
  //   });
  //   expect(ret.result).toBe(true);

  //   // 查询数据库校验是否写入数据库
  //   let friends = await userInfoDbInstance.getFriend();
  //   expect(friends).toHaveProperty('length');

  //   let friendIndex = _.findIndex(friends, { uuid: targetUUID });
  //   expect(friendIndex).toBeGreaterThanOrEqual(0);
  // });

  test('getFriends should be ok', async () => {
    let ret = await context.emitEvent('player::getFriends');

    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('list');
    ret.list.map((item) => {
      // 检测返回的好友列表不能带入敏感信息
      expect(item.token).toBeFalsy();
      expect(item.app_token).toBeFalsy();
    });
  });

  test('sendFriendInvite should be ok', async () => {
    const testUser = await context.db.models.player_user.findOne({
      where: {
        username: 'admin6',
      },
    });
    expect(testUser).toBeTruthy();

    const ret = await context.emitEvent('player::sendFriendInvite', {
      to: testUser.uuid,
    });
    expect(ret.result).toBe(true);
    const invite = ret.invite;

    const retDup = await context.emitEvent('player::sendFriendInvite', {
      to: testUser.uuid,
    });
    expect(retDup.result).toBe(false); // 应当不允许重复请求

    const inviteInstance: PlayerInvite = await PlayerInvite.findOne({
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
      let testUser2 = await context.db.models.player_user.findOne({
        where: {
          username: 'admin6',
        },
      });
      let invite = await context.db.models.player_invite.create({
        from_uuid: testUser2.uuid,
        to_uuid: testUser.uuid,
      });

      inviteUUID = invite.uuid;
      expect(inviteUUID).toBeTruthy();
    });

    afterEach(async () => {
      // 移除新建的邀请
      await context.db.models.player_invite.destroy({
        where: {
          uuid: inviteUUID,
        },
      });
      inviteUUID = null;
    });

    test('agree should be ok', async () => {
      let ret = await context.emitEvent('player::agreeFriendInvite', {
        uuid: inviteUUID,
      });
      expect(ret.result).toBe(true);

      let instance = await context.db.models.player_invite.findOne({
        where: {
          uuid: inviteUUID,
        },
      });
      expect(instance).toBeTruthy();
      expect(instance.is_agree).toBe(true);
      expect(instance.is_refuse).toBe(false);
    });

    test('refuse should be ok', async () => {
      let ret = await context.emitEvent('player::refuseFriendInvite', {
        uuid: inviteUUID,
      });
      expect(ret.result).toBe(true);

      let instance = await context.db.models.player_invite.findOne({
        where: {
          uuid: inviteUUID,
        },
      });
      expect(instance).toBeTruthy();
      expect(instance.is_agree).toBe(false);
      expect(instance.is_refuse).toBe(true);
    });

    test('getFriendsInvite should be ok', async () => {
      let ret = await context.emitEvent('player::getFriendsInvite');
      expect(ret.result).toBe(true);

      expect(ret.res).toHaveProperty('length');
      let index = _.findIndex(ret.res, {
        uuid: inviteUUID,
      });
      expect(index).toBeGreaterThanOrEqual(0);
    });

    test('getFriendInviteDetail', async () => {
      const ret = await context.emitEvent('player::getFriendInviteDetail', {
        uuid: inviteUUID,
      });

      expect(ret.result).toBe(true);
      expect(ret.invite).toBeTruthy();
      expect(ret.invite).toMatchObject({
        uuid: inviteUUID,
        to_uuid: testUser.uuid,
      });
    });
  });

  test('check user online should be ok', async () => {
    let selfRet = await context.emitEvent('player::checkUserOnline', {
      uuid: testUser.uuid,
    });

    expect(selfRet.result).toBe(true);
    expect(selfRet.isOnline).toBe(true);

    let errRet = await context.emitEvent('player::checkUserOnline', {
      uuid: Math.random(),
    });

    expect(errRet.result).toBe(true);
    expect(errRet.isOnline).toBe(false);
  });

  test('get settings should be ok', async () => {
    let ret = await context.emitEvent('player::getSettings');
    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('userSettings');
    expect(ret).toHaveProperty('systemSettings');
  });

  test.todo('save settings should be ok');
});
