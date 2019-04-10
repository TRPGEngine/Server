const debug = require('debug')('trpg:component:player:event');
const md5 = require('../md5');
const uuid = require('uuid/v1');
const _ = require('lodash');

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

exports.login = async function login(data, cb, db) {
  let app = this.app;
  let socket = this.socket;

  if (typeof data === 'string') {
    data = JSON.parse(data);
  }

  // if(app.player.list.find(socket)) {
  //   throw '您已经登录，请先登出'
  // }

  let { username, password, platform, isApp } = data;
  let ip =
    _.get(socket, 'handshake.headers.x-real-ip') ||
    _.get(socket, 'handshake.address');

  if (!username || !password) {
    debug('login fail, miss necessary parameter: %o', data);
    throw '缺少必要参数';
  }

  let user = await db.models.player_user.oneAsync({
    username,
    password: md5(password),
  });
  if (!user) {
    debug('login fail, try to login [%s] and password error', username);
    cb({ result: false, msg: '账户或密码错误' });
    await db.models.player_login_log.createAsync({
      user_name: username,
      type: isApp ? 'app_standard' : 'standard',
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
    await user.saveAsync();

    // 添加登录记录
    await db.models.player_login_log.createAsync({
      user_uuid: user.uuid,
      user_name: user.username,
      type: isApp ? 'app_standard' : 'standard',
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

exports.loginWithToken = async function loginWithToken(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  if (typeof data === 'string') {
    data = JSON.parse(data);
  }

  // if(app.player.list.find(socket)) {
  //   cb({result: false, msg: '您已经登录，请先登出'})
  // }

  let { uuid, token, platform, isApp, channel } = data;
  let ip =
    _.get(socket, 'handshake.headers.x-real-ip') ||
    _.get(socket, 'handshake.address');

  if (!uuid || !token) {
    debug('login with token fail, miss necessary parameter: %o', data);
    throw '缺少必要参数';
  }

  let cond = { uuid };
  if (isApp) {
    cond.app_token = token;
  } else {
    cond.token = token;
  }
  let user = await db.models.player_user.oneAsync(cond);

  if (!user) {
    debug('login with token fail, try to login %s', uuid);
    cb({ result: false, msg: 'TOKEN错误或过期' });
    await db.models.player_login_log.createAsync({
      user_uuid: uuid,
      type: isApp ? 'app_token' : 'token',
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
    await user.saveAsync();

    // 添加登录记录
    await db.models.player_login_log.createAsync({
      user_uuid: user.uuid,
      user_name: user.username,
      type: isApp ? 'app_token' : 'token',
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

exports.register = async function register(data, cb, db) {
  let app = this.app;
  let socket = this.socket;

  if (typeof data === 'string') {
    data = JSON.parse(data);
  }

  let username = data.username;
  let password = data.password;

  if (username.length > 18) {
    throw '注册失败!用户名过长';
  }

  if (!username || !password) {
    debug('register fail, miss necessary parameter: %o', data);
    throw '缺少必要参数';
  }

  let modelUser = db.models.player_user;
  let user = await modelUser.findOne({
    where: { username },
  });

  if (!!user) {
    debug('register failed!user %s has been existed', user.username);
    throw '用户名已存在';
  }

  let results = await modelUser.create({
    username,
    password: md5(password),
  });
  debug('register success: %o', results);
  return { results };
};

exports.getInfo = async function getUserInfo(data, cb, db) {
  let app = this.app;
  let socket = this.socket;
  let type = data.type || 'self';
  let uuid = data.uuid;

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

exports.updateInfo = async function updateInfo(data, cb, db) {
  let app = this.app;
  let socket = this.socket;

  let player = app.player.list.find(socket);
  if (!player) {
    throw '用户不存在，请检查登录状态';
  }

  let user_id = player.user.id;

  let user = await db.models.player_user.findByPk(user_id);
  // TODO: 检测用户信息合法性(如禁止敏感字符作为昵称)
  user.updateInfo(data);
  await user.saveAsync();
  return { user: user.getInfo(true) };
};

exports.changePassword = async function changePassword(data, cb, db) {
  let app = this.app;
  let socket = this.socket;

  let player = app.player.list.find(socket);
  if (!player) {
    throw '用户不存在，请检查登录状态';
  }

  let { oldPassword, newPassword } = data;
  oldPassword = md5(oldPassword);
  newPassword = md5(newPassword);

  let user_id = player.user.id;
  let user = await db.models.player_user.findByPk(user_id);
  if (user.password !== oldPassword) {
    throw '原密码不正确';
  }

  user.password = newPassword;
  await user.saveAsync();
  return { user: user.getInfo(true) };
};

exports.logout = async function logout(data, cb, db) {
  const app = this.app;
  const socket = this.socket;
  const { uuid, token, isApp = false } = data;

  if (!uuid || !token) {
    throw '参数不全';
  }

  let where = { uuid };
  if (isApp) {
    where.app_token = token;
  } else {
    where.token = token;
  }

  let user = await db.models.player_user.findOne({ where });
  if (!user) {
    debug('logout fail, try to login %s', uuid);
    throw 'TOKEN错误或过期';
  } else {
    debug('logout success!user %s has been logout', user.uuid);
    user.token = '';
    await user.save();

    // 从列表中移除
    if (!!app.player) {
      app.player.list.remove(user.uuid);
    }

    return true;
  }
};

exports.findUser = async function findUser(data, cb, db) {
  let app = this.app;
  let socket = this.socket;

  let { text, type } = data;
  if (!text || !type) {
    throw '缺少参数';
  }

  let User = db.models.player_user;
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
  for (user of users) {
    results.push(user.getInfo());
  }
  return { results };
};

// TODO: 可能会有问题。是否应该允许用户直接添加好友？
exports.addFriend = async function addFriend(data, cb, db) {
  let app = this.app;
  let socket = this.socket;

  let player = app.player.list.find(socket);
  if (!!player) {
    let uuid1 = player.user.uuid;
    let uuid2 = data.uuid;
    if (!!uuid1 && !!uuid2) {
      try {
        await app.player.makeFriendAsync(uuid1, uuid2, db);
        cb({ result: true });
      } catch (e) {
        debug(e);
        cb({ result: false, msg: '添加好友失败，可能是已经被添加了' });
      }
    } else {
      cb({ result: false, msg: '缺少参数' });
    }
  } else {
    cb({ result: false, msg: '用户状态异常' });
  }
};

exports.getFriends = async function getFriends(data, cb, db) {
  let app = this.app;
  let socket = this.socket;

  let player = app.player.list.find(socket);
  if (!player) {
    throw '用户状态异常';
  }

  let uuid = player.user.uuid;
  let list = await app.player.getFriendsAsync(uuid, db);
  list = list.map((i) => i.getInfo());
  return { list };
};

exports.sendFriendInvite = async function sendFriendInvite(data, cb, db) {
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

exports.refuseFriendInvite = async function refuseFriendInvite(data, cb, db) {
  let app = this.app;
  let socket = this.socket;

  let player = app.player.list.find(socket);
  if (!player) {
    throw '用户状态异常';
  }

  let playerUUID = player.uuid;
  let inviteUUID = data.uuid;
  let invite = await db.models.player_invite.findOne({
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

  return { res: invite };
};

exports.agreeFriendInvite = async function agreeFriendInvite(data, cb, db) {
  let app = this.app;
  let socket = this.socket;

  let player = app.player.list.find(socket);
  if (!player) {
    throw '用户状态异常';
  }

  let inviteUUID = data.uuid;
  let invite = await db.models.player_invite.oneAsync({
    uuid: inviteUUID,
    to_uuid: player.uuid,
  });
  if (!invite) {
    throw '没有找到该邀请';
  }

  invite.is_agree = true;
  await db.transactionAsync(async () => {
    await invite.saveAsync();
    // 设定好友关系
    let uuid1 = invite.from_uuid;
    let uuid2 = invite.to_uuid;
    await app.player.makeFriendAsync(uuid1, uuid2, db);

    // 发送更新好友的通知
    let player1 = app.player.list.get(uuid1);
    if (player1) {
      player1.socket.emit('player::addFriend', { uuid: uuid2 });
    }
  });

  return { invite };
};

exports.getFriendsInvite = async function getFriendsInvite(data, cb, db) {
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
exports.checkUserOnline = async function checkUserOnline(data, cb, db) {
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

exports.getSettings = async function getSettings(data, cb, db) {
  let app = this.app;
  let socket = this.socket;

  let player = app.player.list.find(socket);
  if (!player) {
    throw '当前用户不存在';
  }
  let uuid = player.uuid;

  let settings = await db.models.player_settings.oneAsync({ user_uuid: uuid });

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

exports.saveSettings = async function saveSettings(data, cb, db) {
  let app = this.app;
  let socket = this.socket;

  let { userSettings, systemSettings } = data;

  let player = app.player.list.find(socket);
  if (!player) {
    throw '当前用户不存在';
  }
  let uuid = player.uuid;

  let settings = await db.models.player_settings.oneAsync({ user_uuid: uuid });
  if (!settings) {
    settings = await db.models.player_settings.createAsync({
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
    await settings.saveAsync();
  }

  return {
    userSettings: settings.user_settings,
    systemSettings: settings.system_settings,
  };
};
