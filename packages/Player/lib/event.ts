import Debug from 'debug';
const debug = Debug('trpg:component:player:event');
import uuid from 'uuid/v1';
import _ from 'lodash';
import { EventFunc } from 'trpg/core';
import { PlayerUser } from './models/user';
import { TRPGApplication, Socket } from 'trpg/core';
import { Platform } from '../types/player';
import { PlayerInvite } from './models/invite';
import { autoJoinSocketRoom } from './managers/socketroom-manager';
import { PlayerSettings } from './models/settings';

export const login: EventFunc<{
  username: string;
  password: string;
  platform: Platform;
  isApp: boolean;
}> = async function login(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  // if(app.player.list.find(socket)) {
  //   throw new Error('您已经登录，请先登出')
  // }

  const { username, password, platform, isApp } = data;
  const ip =
    _.get(socket, 'handshake.headers.x-real-ip') ||
    _.get(socket, 'handshake.address');

  if (!username || !password) {
    debug('login fail, miss necessary parameter: %o', data);
    throw new Error('缺少必要参数');
  }

  const user = await PlayerUser.findByUsernameAndPassword(username, password);

  if (!user) {
    debug('login fail, try to login [%s] and password error', username);
    cb({ result: false, msg: '用户不存在或密码错误' });
    await db.models.player_login_log.create({
      user_name: username,
      type: isApp ? 'app_standard' : 'standard',
      socket_id: socket.id,
      ip,
      platform,
      device_info: {
        userAgent: _.get(socket, 'handshake.headers.user-agent'),
        acceptLanguage: _.get(socket, 'handshake.headers.accept-language'),
      },
      is_success: false,
    });
  } else {
    if (user.banned === true) {
      throw new Error('您已被封禁');
    }

    debug(
      'login success!user [%s(%s)] has been login',
      user.username,
      user.uuid
    );
    if (isApp) {
      user.app_token = uuid();
    } else {
      user.token = uuid();
    }

    // 加入到列表中
    if (!!app.player) {
      await app.player.manager.addPlayer(user.uuid, socket, platform);
      await autoJoinSocketRoom(app, socket);
    }

    await socket.iosession.set('user', user.getInfo(true)); // 将用户信息加入到session中

    cb({ result: true, info: user.getInfo(true) });

    // 更新登录信息
    user.last_login = new Date();
    user.last_ip = ip;
    await user.save();

    // 添加登录记录
    await db.models.player_login_log.create({
      user_uuid: user.uuid,
      user_name: user.username,
      type: isApp ? 'app_standard' : 'standard',
      socket_id: socket.id,
      ip,
      platform,
      device_info: {
        userAgent: _.get(socket, 'handshake.headers.user-agent'),
        acceptLanguage: _.get(socket, 'handshake.headers.accept-language'),
      },
      is_success: true,
      token: isApp ? user.app_token : user.token,
    });
  }
};

export const loginWithToken: EventFunc<{
  uuid: string;
  token: string;
  platform: Platform;
  isApp: boolean;
  channel: string;
}> = async function loginWithToken(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  // if(app.player.list.find(socket)) {
  //   cb({result: false, msg: '您已经登录，请先登出'})
  // }

  const { uuid, token, platform, isApp, channel } = data;
  const ip =
    _.get(socket, 'handshake.headers.x-real-ip') ||
    _.get(socket, 'handshake.address');

  if (!uuid || !token) {
    debug('login with token fail, miss necessary parameter: %o', data);
    throw new Error('缺少必要参数');
  }

  let cond = { uuid };
  if (isApp) {
    cond['app_token'] = token;
  } else {
    cond['token'] = token;
  }
  const user = await PlayerUser.scope('login').findOne({ where: cond });

  if (!user) {
    debug('login with token fail, try to login %s', uuid);
    cb({ result: false, msg: 'TOKEN错误或过期' });
    await db.models.player_login_log.create({
      user_uuid: uuid,
      type: isApp ? 'app_token' : 'token',
      socket_id: socket.id,
      channel,
      ip,
      platform,
      device_info: {
        userAgent: _.get(socket, 'handshake.headers.user-agent'),
        acceptLanguage: _.get(socket, 'handshake.headers.accept-language'),
      },
      is_success: false,
    });
  } else {
    if (user.banned === true) {
      throw new Error('您已被封禁');
    }

    debug('login with token success!user %s has been login', user.uuid);

    // 加入到列表中
    if (!!app.player) {
      await app.player.manager.addPlayer(user.uuid, socket, platform);
      await autoJoinSocketRoom(app, socket);
    }
    await socket.iosession.set('user', user.getInfo(true)); // 将用户信息加入到session中

    cb({ result: true, info: user.getInfo(true) });

    // 更新登录信息
    user.last_login = new Date();
    user.last_ip = ip;
    await user.save();

    // 添加登录记录
    await db.models.player_login_log.create({
      user_uuid: user.uuid,
      user_name: user.username,
      type: isApp ? 'app_token' : 'token',
      socket_id: socket.id,
      channel,
      ip,
      platform,
      device_info: {
        userAgent: _.get(socket, 'handshake.headers.user-agent'),
        acceptLanguage: _.get(socket, 'handshake.headers.accept-language'),
      },
      is_success: true,
      token: isApp ? user.app_token : user.token,
    });
  }
};

/**
 * 签发jwt 用于通用验证
 */
export const getWebToken: EventFunc<{}> = async function getWebToken(
  data,
  cb,
  db
) {
  const { app, socket } = this;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('当前用户不存在');
  }

  const jwt = await PlayerUser.signJWT(player.uuid);

  return { jwt };
};

export const register: EventFunc<{
  username: string;
  password: string;
}> = async function register(data, cb, db) {
  const username = data.username;
  const password = data.password;

  const results = await PlayerUser.registerUser(username, password);
  debug('register success: %o', results);
  return { results };
};

export const getInfo: EventFunc<{
  type: 'self' | 'user';
  uuid: string;
}> = async function getUserInfo(data, cb, db) {
  const app = this.app;
  const socket = this.socket;
  const type = data.type || 'self';
  const uuid = data.uuid;

  if (!type) {
    throw new Error('参数不全');
  }

  if (type === 'self') {
    const player = app.player.manager.findPlayer(socket);
    if (!!player) {
      const user = await PlayerUser.findByUUID(player.uuid);
      return { info: user.getInfo() };
    } else {
      throw new Error('用户不存在，请检查登录状态');
    }
  } else if (type === 'user') {
    let user = await PlayerUser.findByUUID(uuid);
    if (!!user) {
      return {
        info: user.getInfo(),
      };
    } else {
      throw new Error('用户不存在');
    }
  } else {
    throw new Error('未知的类型');
  }
};

export const updateInfo: EventFunc = async function updateInfo(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const user = await PlayerUser.findByUUID(player.uuid);
  // TODO: 检测用户信息合法性(如禁止敏感字符作为昵称)
  user.updateInfo(data);
  await user.save();
  return { user: user.getInfo(true) };
};

export const changePassword: EventFunc<{
  oldPassword: string;
  newPassword: string;
}> = async function changePassword(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const { oldPassword, newPassword } = data;
  // oldPassword = md5(oldPassword);
  // newPassword = md5(newPassword);

  const { username } = await PlayerUser.findByUUID(player.uuid);
  const user = await PlayerUser.findByUsernameAndPassword(
    username,
    oldPassword
  );
  if (!user) {
    throw new Error('原密码不正确');
  }

  user.password = PlayerUser.genPassword(newPassword, user.salt); // 还是用原来的盐值
  await user.save();
  return { user: user.getInfo(true) };
};

export const logout: EventFunc<{
  uuid: string;
  token: string;
  isApp: boolean;
}> = async function logout(data, cb, db) {
  const app = this.app;
  const socket = this.socket;
  const { uuid, token, isApp = false } = data;

  if (!uuid || !token) {
    throw new Error('参数不全');
  }

  const where = { uuid };
  if (isApp) {
    where['app_token'] = token;
  } else {
    where['token'] = token;
  }

  const user = await PlayerUser.findOne({ where });
  if (!user) {
    debug('logout fail, try to logout %s', uuid);
    throw new Error('TOKEN错误或过期');
  } else {
    debug('logout success!user %s has been logout', user.uuid);
    user.token = '';
    await user.save();

    cb({ result: true });

    // 记录用户离线时间
    app.player.recordUserOfflineDate(socket);

    // 从列表中移除
    if (!!app.player) {
      await app.player.manager.removePlayer(user.uuid, isApp ? 'app' : 'web');
    }
  }
};

export const findUser: EventFunc<{
  text: string;
  type: 'uuid' | 'username' | 'nickname';
}> = async function findUser(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const { text, type } = data;
  if (!text || !type) {
    throw new Error('缺少参数');
  }

  const User = db.models.player_user;
  let users = [];
  if (type === 'uuid') {
    users = await User.findAll({
      where: { uuid: text },
      limit: 10,
    });
  } else if (type === 'username') {
    users = await User.findAll({
      where: {
        username: {
          [db.op.like]: `%${text}%`,
        },
      },
      limit: 10,
    });
  } else if (type === 'nickname') {
    users = await User.findAll({
      where: {
        nickname: {
          [db.op.like]: `%${text}%`,
        },
      },
      limit: 10,
    });
  }

  let results = [];
  for (let user of users) {
    results.push(user.getInfo());
  }
  return { results };
};

export const getFriends: EventFunc = async function getFriends(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户状态异常');
  }

  const uuid = player.uuid;
  let list = await app.player.getFriendsAsync(uuid, db);
  list = list.map((i) => i.getInfo());
  return { list };
};

/**
 * 发送好友请求
 */
export const sendFriendInvite: EventFunc<{
  to: string;
}> = async function sendFriendInvite(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户状态异常');
  }

  const from_uuid = player.uuid;
  const to_uuid = data.to;

  const invite = await PlayerInvite.sendFriendInvite(from_uuid, to_uuid);

  return { invite };
};

/**
 * 拒绝好友请求
 */
export const refuseFriendInvite: EventFunc<{
  uuid: string;
}> = async function refuseFriendInvite(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户状态异常');
  }

  const playerUUID = player.uuid;
  const inviteUUID = data.uuid;
  const invite = await db.models.player_invite.findOne({
    where: {
      uuid: inviteUUID,
      to_uuid: playerUUID,
    },
  });
  if (!invite) {
    throw new Error('没有找到该邀请');
  }

  invite.is_refuse = true;
  await invite.save();

  if (app.chat) {
    // 如果 chat 模块已注册
    const user = await PlayerUser.findByUUID(player.uuid);
    app.chat.sendSystemMsg(
      invite.from_uuid,
      '',
      '',
      `${user.getName()} 已拒绝你的好友申请`
    );
  }

  return { res: invite };
};

/**
 * 同意好友请求
 */
export const agreeFriendInvite: EventFunc<{
  uuid: string;
}> = async function agreeFriendInvite(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户状态异常');
  }

  const inviteUUID = data.uuid;

  if (_.isNil(inviteUUID)) {
    throw new Error('缺少必要参数');
  }

  const invite = await db.models.player_invite.findOne({
    where: {
      uuid: inviteUUID,
      to_uuid: player.uuid,
    },
  });
  if (!invite) {
    throw new Error('没有找到该好友申请');
  }

  invite.is_agree = true;
  await db.transactionAsync(async () => {
    await invite.save();
    // 设定好友关系
    const uuid1 = invite.from_uuid; // 邀请发起人
    const uuid2 = invite.to_uuid; // 邀请接受人(同意好友邀请的人)
    await app.player.makeFriendAsync(uuid1, uuid2, db);

    // 发送更新好友的通知
    app.player.manager.unicastSocketEvent(uuid1, 'player::appendFriend', {
      uuid: uuid2,
    });
    if (app.chat) {
      // 如果 chat 模块已注册
      const user = await PlayerUser.findByUUID(player.uuid);
      app.chat.sendSystemMsg(
        uuid1,
        '',
        '',
        `${user.getName()} 已同意你的好友申请`
      );
    }
  });

  return { invite };
};

/**
 * 移除好友请求
 */
export const removeFriendInvite: EventFunc<{
  inviteUUID: string;
}> = async function(data) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户状态异常');
  }

  const { inviteUUID } = data;
  if (_.isNil(inviteUUID)) {
    throw new Error('缺少必要参数');
  }

  await PlayerInvite.removeFriendInvite(inviteUUID, player.uuid);

  return true;
};

export const getFriendsInvite: EventFunc = async function getFriendsInvite(
  data,
  cb,
  db
) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户状态异常');
  }

  const uuid = player.uuid;
  const res = await PlayerInvite.getAllUnprocessedInvites(uuid);

  return { res };
};

/**
 * 获取好友请求详情信息
 */
export const getFriendInviteDetail: EventFunc<{
  uuid: string;
}> = async function(data, cb, db) {
  const { app, socket } = this;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户状态异常');
  }

  const uuid = data.uuid;
  const to_uuid = player.uuid;

  const invite = await PlayerInvite.findOne({
    where: {
      uuid,
      to_uuid,
    },
  });

  return { invite };
};

// 检查用户是否在线
export const checkUserOnline: EventFunc<{
  uuid: string;
}> = async function checkUserOnline(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const uuid = data.uuid;
  if (!uuid) {
    throw new Error('缺少必要参数');
  }
  const isOnline = await app.player.manager.checkPlayerOnline(uuid);
  return {
    isOnline,
  };
};

export const getSettings: EventFunc = async function getSettings(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('当前用户不存在');
  }
  const uuid = player.uuid;

  const settings = await PlayerSettings.getUserSettings(uuid);

  return {
    ...settings,
  };
};

export const saveSettings: EventFunc<{
  userSettings: {};
  systemSettings: {};
}> = async function saveSettings(data, cb, db) {
  let app = this.app;
  let socket = this.socket;

  let { userSettings, systemSettings } = data;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('当前用户不存在');
  }
  let uuid = player.uuid;

  let settings = await db.models.player_settings.findOne({
    where: { user_uuid: uuid },
  });
  if (!settings) {
    settings = await db.models.player_settings.create({
      user_uuid: uuid,
      user_settings: userSettings || {},
      system_settings: systemSettings || {},
    });
  } else {
    settings.user_settings = Object.assign(
      {},
      settings.user_settings,
      userSettings
    );
    settings.system_settings = Object.assign(
      {},
      settings.system_settings,
      systemSettings
    );
    await settings.save();
  }

  return {
    userSettings: settings.user_settings,
    systemSettings: settings.system_settings,
  };
};

/**
 * 获取用户初始数据
 * 用于减少初始的请求
 */
export const getUserInitData: EventFunc = async function(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户状态异常');
  }

  const userUUID = player.uuid;
  const user = await PlayerUser.findByUUID(userUUID);

  // 获取用户列表
  const friendList = await user.getFriendList();

  // 获取所有未处理的好友邀请
  const unprocessedFriendInvites = await PlayerInvite.getAllUnprocessedInvites(
    userUUID
  );

  // 获取用户设置与系统设置
  const settings = await PlayerSettings.getUserSettings(userUUID);

  return {
    friendList,
    unprocessedFriendInvites,
    settings,
  };
};
