import Debug from 'debug';
const debug = Debug('trpg:component:player:event');
import md5 from './utils/md5';
import sha1 from './utils/sha1';
import uuid from 'uuid/v1';
import _ from 'lodash';
import { EventFunc } from 'trpg/core';
import { PlayerUser } from './models/user';

let autoJoinSocketRoom = async function autoJoinSocketRoom(socket) {
  if (!socket) {
    debug('add room error. not find this socket');
    return;
  }

  const app = this;
  const player = app.player.list.find(socket);
  if (!player) {
    debug('add room error. not find this socket attach player');
    return;
  }

  if (!app.group) {
    debug('add room error. need group component');
    return;
  }

  let groups = await player.user.getGroups();
  for (let group of groups) {
    let uuid = group.uuid;
    socket.join(uuid);
  }
};

export const login: EventFunc<{
  username: string;
  password: string;
  platform: string;
  isApp: boolean;
}> = async function login(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  // if(app.player.list.find(socket)) {
  //   throw '您已经登录，请先登出'
  // }

  const { username, password, platform, isApp } = data;
  const ip =
    _.get(socket, 'handshake.headers.x-real-ip') ||
    _.get(socket, 'handshake.address');

  if (!username || !password) {
    debug('login fail, miss necessary parameter: %o', data);
    throw '缺少必要参数';
  }

  const user = await PlayerUser.findByUsernameAndPassword(username, password);

  if (!user) {
    debug('login fail, try to login [%s] and password error', username);
    cb({ result: false, msg: '账户或密码错误' });
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
      app.player.list.add(user, socket);
      await autoJoinSocketRoom.call(app, socket);
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
  platform: string;
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
    throw '缺少必要参数';
  }

  let cond = { uuid };
  if (isApp) {
    cond['app_token'] = token;
  } else {
    cond['token'] = token;
  }
  let user = await db.models.player_user.findOne({ where: cond });

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
    debug('login with token success!user %s has been login', user.uuid);

    // 加入到列表中
    if (!!app.player) {
      app.player.list.add(user, socket);
      await autoJoinSocketRoom.call(app, socket);
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

export const register: EventFunc<{
  username: string;
  password: string;
}> = async function register(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const username = data.username;
  const password = data.password;

  if (username.length > 18) {
    throw '注册失败!用户名过长';
  }

  if (!username || !password) {
    debug('register fail, miss necessary parameter: %o', data);
    throw '缺少必要参数';
  }

  const user = await PlayerUser.findOne({
    where: { username },
  });

  if (!!user) {
    debug('register failed!user %s has been existed', user.username);
    throw '用户名已存在';
  }

  const salt = PlayerUser.genSalt();
  const results = await PlayerUser.create({
    username,
    password: PlayerUser.genPassword(password, salt), // 存储密码为sha1(md5(md5(realpass)) + salt)
    salt,
  });
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
    throw '参数不全';
  }

  if (type === 'self') {
    let player = app.player.list.find(socket);
    if (!!player) {
      cb({ result: true, info: player.user });
    } else {
      cb({ result: false, msg: '用户不存在，请检查登录状态' });
    }
  } else if (type === 'user') {
    let user = await db.models.player_user.findOne({ where: { uuid } });
    if (!!user) {
      return {
        info: user.getInfo(),
      };
    } else {
      throw '用户不存在';
    }
  } else {
    throw '未知的类型';
  }
};

export const updateInfo: EventFunc = async function updateInfo(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.list.find(socket);
  if (!player) {
    throw '用户不存在，请检查登录状态';
  }

  const userId = player.user.id;

  const user = await db.models.player_user.findByPk(userId);
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

  const player = app.player.list.find(socket);
  if (!player) {
    throw '用户不存在，请检查登录状态';
  }

  let { oldPassword, newPassword } = data;
  // oldPassword = md5(oldPassword);
  // newPassword = md5(newPassword);

  const username = player.user.username;
  const user = await PlayerUser.findByUsernameAndPassword(
    username,
    oldPassword
  );
  if (!user) {
    throw '原密码不正确';
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
    throw '参数不全';
  }

  let where = { uuid };
  if (isApp) {
    where['app_token'] = token;
  } else {
    where['token'] = token;
  }

  let user = await db.models.player_user.findOne({ where });
  if (!user) {
    debug('logout fail, try to login %s', uuid);
    throw 'TOKEN错误或过期';
  } else {
    debug('logout success!user %s has been logout', user.uuid);
    user.token = '';
    await user.save();

    // 记录用户离线时间
    app.player.recordUserOfflineDate(socket);

    // 从列表中移除
    if (!!app.player) {
      app.player.list.remove(user.uuid);
    }

    return true;
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
    throw '缺少参数';
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

  const player = app.player.list.find(socket);
  if (!player) {
    throw '用户状态异常';
  }

  let uuid = player.user.uuid;
  let list = await app.player.getFriendsAsync(uuid, db);
  list = list.map((i) => i.getInfo());
  return { list };
};

export const sendFriendInvite: EventFunc<{
  to: string;
}> = async function sendFriendInvite(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.list.find(socket);
  if (!player) {
    throw '用户状态异常';
  }

  const from_uuid = player.user.uuid;
  const to_uuid = data.to;

  const Invite = db.models.player_invite;
  const inviteIsExist = await Invite.findOne({
    where: {
      from_uuid,
      to_uuid,
      is_agree: false,
      is_refuse: false,
    },
  });

  if (!!inviteIsExist) {
    throw '重复请求';
  }

  let invite = await Invite.create({ from_uuid, to_uuid });
  let to_player = app.player.list.get(to_uuid);
  if (!!to_player) {
    let socket = to_player.socket;
    socket.emit('player::invite', invite);
  }

  if (app.chat && app.chat.sendMsg) {
    let msg = `${player.user.nickname || player.user.username} 想添加您为好友`;
    app.chat.sendSystemMsg(to_uuid, 'friendInvite', '好友邀请', msg, {
      invite,
    });
  }

  return { invite };
};

export const refuseFriendInvite: EventFunc<{
  uuid: string;
}> = async function refuseFriendInvite(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.list.find(socket);
  if (!player) {
    throw '用户状态异常';
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
    throw '没有找到该邀请';
  }

  invite.is_refuse = true;
  await invite.save();

  if (app.chat) {
    // 如果 chat 模块已注册
    app.chat.sendSystemMsg(
      invite.from_uuid,
      '',
      '',
      `${_.get(player, 'user.username', '') ||
        _.get(player, 'user.nickname', '')} 已拒绝你的好友申请`
    );
  }

  return { res: invite };
};

export const agreeFriendInvite: EventFunc<{
  uuid: string;
}> = async function agreeFriendInvite(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.list.find(socket);
  if (!player) {
    throw '用户状态异常';
  }

  const inviteUUID = data.uuid;
  const invite = await db.models.player_invite.findOne({
    where: {
      uuid: inviteUUID,
      to_uuid: player.uuid,
    },
  });
  if (!invite) {
    throw '没有找到该好友申请';
  }

  invite.is_agree = true;
  await db.transactionAsync(async () => {
    await invite.save();
    // 设定好友关系
    const uuid1 = invite.from_uuid; // 邀请发起人
    const uuid2 = invite.to_uuid; // 邀请接受人(同意好友邀请的人)
    await app.player.makeFriendAsync(uuid1, uuid2, db);

    // 发送更新好友的通知
    const player1 = app.player.list.get(uuid1);
    if (player1) {
      player1.socket.emit('player::appendFriend', { uuid: uuid2 });
    }
    if (app.chat) {
      // 如果 chat 模块已注册
      app.chat.sendSystemMsg(
        uuid1,
        '',
        '',
        `${_.get(player, 'user.username', '') ||
          _.get(player, 'user.nickname', '')} 已同意你的好友申请`
      );
    }
  });

  return { invite };
};

export const getFriendsInvite: EventFunc = async function getFriendsInvite(
  data,
  cb,
  db
) {
  let app = this.app;
  let socket = this.socket;

  let player = app.player.list.find(socket);
  if (!player) {
    throw '用户状态异常';
  }

  let uuid = player.user.uuid;
  let res = await db.models.player_invite.findAll({
    where: {
      to_uuid: uuid,
      is_agree: false,
      is_refuse: false,
    },
  });

  return { res };
};

// 检查用户是否在线
export const checkUserOnline: EventFunc<{
  uuid: string;
}> = async function checkUserOnline(data, cb, db) {
  let app = this.app;
  let socket = this.socket;

  let uuid = data.uuid;
  if (!uuid) {
    throw '缺少必要参数';
  }
  let player = app.player.list.get(uuid);
  return {
    isOnline: !!player,
  };
};

export const getSettings: EventFunc = async function getSettings(data, cb, db) {
  let app = this.app;
  let socket = this.socket;

  let player = app.player.list.find(socket);
  if (!player) {
    throw '当前用户不存在';
  }
  let uuid = player.uuid;

  let settings = await db.models.player_settings.findOne({
    where: { user_uuid: uuid },
  });

  if (!settings) {
    // 没有记录过用户设置
    return {
      userSettings: {},
      systemSettings: {},
    };
  }

  return {
    userSettings: settings.user_settings || {},
    systemSettings: settings.system_settings || {},
  };
};

export const saveSettings: EventFunc<{
  userSettings: {};
  systemSettings: {};
}> = async function saveSettings(data, cb, db) {
  let app = this.app;
  let socket = this.socket;

  let { userSettings, systemSettings } = data;

  let player = app.player.list.find(socket);
  if (!player) {
    throw '当前用户不存在';
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
