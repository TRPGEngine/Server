const debug = require('debug')('trpg:component:chat:event');
const generateUUID = require('uuid/v4');

let addChatLog = function addChatLog(messagePkg) {
  let app = this;
  let log = app.chat.log;
  if(!!log && !!messagePkg) {
    let pkg = {
      uuid: messagePkg.uuid || generateUUID(),
      sender_uuid: messagePkg.sender_uuid,
      to_uuid:messagePkg.to_uuid,
      converse_uuid:messagePkg.converse_uuid,
      message:messagePkg.message,
      type:messagePkg.type,
      is_group:messagePkg.is_group,
      is_public:messagePkg.is_public,
      date: messagePkg.date ? new Date(messagePkg.date) : new Date(),
      data: messagePkg.data,
    }
    log.push(pkg);

    return pkg;
  }else {
    return false;
  }
}

// 弃用
// let saveChatLog = function saveChatLog() {
//   let app = this;
//   let logList = app.chat.log;
//   let cacheList = Object.assign([], logList);// 缓存区
//   logList.splice(0, cacheList.length);
//   app.storage.connect(function(db) {
//     let Log = db.models.chat_log;
//     Log.create(cacheList, function(err) {
//       db.close();
//       if(!!err) {
//         console.warn('try to save log list error:', cacheList);
//         console.warn('saveChatLog Error:', err);
//       }
//     })
//   });
//
//   debug('chat log auto saving...');
// }

// 弃用
// let getChatLog = async function getChatLog(data, cb) {
//   let app = this.app;
//   let logList = app.chat.log;
//   let converse_uuid = data.converse_uuid;
//   let offsetDate = data.offsetDate || '';
//   let limit = data.limit || 10;
//   if(!converse_uuid) {
//     cb({result: false, msg: '缺少必要参数'})
//     return;
//   }
//
//   try {
//     let list = [];
//     let db = await app.storage.connectAsync();
//     if(!offsetDate) {
//       // 初始获取聊天记录
//       let logs = await db.models.chat_log.find().order('-date').limit(limit).findAsync({converse_uuid});
//       list = list.concat(logs);
//       // 获取缓存中的聊天记录
//       for (log of logList) {
//         if(log.converse_uuid === converse_uuid) {
//           list.push(log);
//           continue;
//         }
//       }
//     }else {
//       let dateCond = app.storage._orm.lte(new Date(offsetDate));
//       let logs = await db.models.chat_log.find().order('-date').limit(limit).findAsync({converse_uuid, date: dateCond});
//       list = list.concat(logs);
//     }
//     cb({result: true, list});
//     db.close();
//   }catch (err) {
//     cb({result: false, msg: err.toString()})
//   }
// }

// 获取某一用户与当前用户的聊天记录
let getUserChatLog = async function getUserChatLog(data, cb, db) {
  const app = this.app;
  const socket = this.socket;
  const logList = app.chat.log;
  const Op = app.storage.Op;
  let userUUID = data.user_uuid;
  let offsetDate = data.offsetDate || '';
  let limit = data.limit || 10;

  if(!userUUID) {
    throw '缺少必要参数';
  }

  let player = app.player.list.find(socket);
  if(!player) {
    throw '尚未登录';
  }
  let selfUUID = player.uuid;
  // IDEA: 定义: 获取用户间会话记录时无视掉自身发送的tip类型信息
  let where = {
    converse_uuid: null,
    [Op.or]: [
      {sender_uuid: userUUID, to_uuid: selfUUID},
      {sender_uuid: selfUUID, to_uuid: userUUID, type: {[Op.ne]: 'tip'}}
    ]
  }

  let list = [];
  if(!offsetDate) {
    // 初始获取聊天记录
    let logs = await db.models.chat_log.findAll({
      where,
      limit,
      order: [['date', 'DESC']]
    })
    list = list.concat(logs);
    // 获取缓存中的聊天记录
    for (log of logList) {
      if(
        !log.converse_uuid &&
        (
          log.sender_uuid === userUUID && log.to_uuid === selfUUID ||
          log.sender_uuid === selfUUID && log.to_uuid === userUUID && log.type !== 'tip'
        )
      ) {
        list.push(log);
        continue;
      }
    }
  }else {
    where['date'] = {
      [Op.lte]: new Date(offsetDate)
    }
    let logs = await db.models.chat_log.findAll({
      where,
      limit,
      order: [['date', 'DESC']]
    })
    list = list.concat(logs);
  }
  return {list};
}

let getConverseChatLog = async function getConverseChatLog(data, cb, db) {
  const app = this.app;
  const socket = this.socket;
  const logList = app.chat.log;
  const Op = app.storage.Op;
  let converse_uuid = data.converse_uuid;
  let offsetDate = data.offsetDate || '';
  let limit = data.limit || 10;
  if(!converse_uuid) {
    throw '缺少必要参数';
  }

  let player = app.player.list.find(socket);
  if(!player) {
    throw '尚未登录';
  }
  let selfUUID = player.uuid;

  let list = [];
  let where = {
    converse_uuid,
    [Op.or]: [
      // 只会获取非私聊，或者会话中私聊给自己的信息
      {to_uuid: null},
      {to_uuid: ''},
      {to_uuid: selfUUID}
    ]
  }
  if(!offsetDate) {
    // 初始获取聊天记录
    let logs = await db.models.chat_log.findAll({
      where,
      limit,
      order: [['date', 'DESC']]
    })
    list = list.concat(logs);
    // 获取缓存中的聊天记录
    for (let log of logList) {
      if(log.converse_uuid === converse_uuid && (!log.to_uuid || log.to_uuid == selfUUID)) {
        list.push(log);
        continue;
      }
    }
  }else {
    where['date'] = {
      [Op.lte]: new Date(offsetDate)
    }
    let logs = await db.models.chat_log.findAll({
      where,
      limit,
      order: [['date', 'DESC']]
    })
    list = list.concat(logs);
  }
  return {list}
}

let getAllUserConverse = async function getAllUserConverse(data, cb, db) {
  const app = this.app;
  const socket = this.socket;
  const Op = app.storage.Op;

  let player = app.player.list.find(socket);
  if(!player) {
    throw '尚未登录';
  }

  let senders = [];
  // 获取缓存中的会话列表
  for (let log of app.chat.log) {
    if(
      !/^trpg/.test(log.sender_uuid) &&
      log.to_uuid === player.uuid &&
      log.converse_uuid == null &&
      log.is_group === false
    ) {
      senders.push(log.sender_uuid);
    } else if(
      !/^trpg/.test(log.to_uuid) &&
      log.sender_uuid === player.uuid &&
      log.converse_uuid == null &&
      log.is_group === false
    ) {
      senders.push(log.to_uuid);
    }
  }

  let ret1 = await db.models.chat_log.aggregate('sender_uuid', 'DISTINCT', {
    where: {
      sender_uuid: {[Op.notLike]: 'trpg%'},
      to_uuid: player.uuid,
      converse_uuid: null,
      is_group: false,
    },
    plain: false,
  }).then(list => list.map(item => item['DISTINCT']));
  let ret2 = await db.models.chat_log.aggregate('to_uuid', 'DISTINCT', {
    where: {
      sender_uuid: player.uuid,
      to_uuid: {[Op.notLike]: 'trpg%'},
      converse_uuid: null,
      is_group: false
    },
    plain: false,
  }).then(list => list.map(item => item['DISTINCT']));
  senders = [...senders, ...ret1, ...ret2];
  // 数组去重与过滤
  senders = Array.from(new Set(senders)).filter(Boolean);
  return {senders}
}

let getOfflineUserConverse = async function getOfflineUserConverse(data, cb, db) {
  const app = this.app;
  const socket = this.socket;
  const Op = app.storage.Op;
  let lastLoginDate = data.lastLoginDate;
  if(!lastLoginDate) {
    throw '缺少必要参数';
  }

  let player = app.player.list.find(socket);
  if(!player) {
    throw '尚未登录';
  }
  let senders = [];

  // 获取缓存中的聊天记录
  for (let log of app.chat.log) {
    if(
      new Date(log.date) > new Date(lastLoginDate) &&
      !/^trpg/.test(log.sender_uuid) &&
      log.to_uuid === player.uuid &&
      log.converse_uuid == null &&
      log.is_group === false
    ) {
      senders.push(log.sender_uuid);
    } else if(
      new Date(log.date) > new Date(lastLoginDate) &&
      !/^trpg/.test(log.to_uuid) &&
      log.sender_uuid === player.uuid &&
      log.converse_uuid == null &&
      log.is_group === false
    ) {
      senders.push(log.to_uuid);
    }
  }

  let dateCond = {[Op.gte]: new Date(lastLoginDate)};
  let ret1 = await db.models.chat_log.aggregate('sender_uuid', 'DISTINCT', {
    where: {
      sender_uuid: {[Op.notLike]: 'trpg%'},
      to_uuid: player.uuid,
      converse_uuid: null,
      date: dateCond,
      is_group: false,
    },
    plain: false,
  }).then(list => list.map(item => item['DISTINCT']));
  let ret2 = await db.models.chat_log.aggregate('to_uuid', 'DISTINCT', {
    where: {
      sender_uuid: player.uuid,
      to_uuid: {[Op.notLike]: 'trpg%'},
      converse_uuid: null,
      date: dateCond,
      is_group: false,
    },
    plain: false,
  }).then(list => list.map(item => item['DISTINCT']));
  senders = [...senders, ...ret1, ...ret2];
  // 数组去重与过滤
  senders = Array.from(new Set(senders)).filter(Boolean);
  return {senders}
}

let message = function message(data, cb) {
  let app = this.app;
  let socket = this.socket;
  if(!!app.player) {
    let player = app.player;
    let message = data.message;
    message = app.xss(message); // 将传输的信息进行xss处理 // TODO: 可能需要处理单独的发送< 与 > 的情况
    let sender_uuid = data.sender_uuid;
    let to_uuid = data.to_uuid;
    let converse_uuid = data.converse_uuid;
    let type = data.type || 'normal';
    let is_public = data.is_public || false;
    let is_group = data.is_group || false;
    let date = data.date;
    let _uuid = generateUUID();
    let _data = data.data || null;
    let _pkg = {message, sender_uuid, to_uuid, converse_uuid, type, is_public, is_group, date, uuid: _uuid, data: _data};

    debug('[用户#%s]: %s', sender_uuid, message);
    if(!!message) {
      let pkg = addChatLog.call(app, _pkg);
      if(!pkg) {
        cb({result: false, msg: '信息服务出现异常'});
        return;
      }

      if(!is_public) {
        // 仅个人可见
        if(sender_uuid !== to_uuid) {
          // 私聊
          let other = player.list.get(to_uuid);
          if(!!other) {
            other.socket.emit('chat::message', pkg);
          }else {
            debug('[用户:%s]: 接收方%s不在线', sender_uuid, to_uuid);
          }
        }
      } else {
        // 所有人可见
        if(!is_group) {
          // 公聊
          socket.broadcast.emit('chat::message', pkg);
        }else {
          // 群聊
          socket.broadcast.to(converse_uuid).emit('chat::message', pkg);
        }
      }
      cb({result: true, pkg});
    } else {
      cb({result: false, msg: '聊天内容不能为空'});
    }
  }else{
    throw new Error('[ChatComponent] require component [PlayerComponent]');
  }
}

// 会话创建用于多人会话, 创建团以后自动生成一个团会话
// !!! 弃用
let createConverse = async function createConverse(data, cb) {
  let app = this.app;
  let socket = this.socket;

  try {
    let player = app.player.list.find(socket);
    if(!player) {
      cb({result: false, msg: '尚未登录'});
      return;
    }

    let db = await app.storage.connectAsync();
    let uuid = data.uuid;
    let type = data.type || 'user';
    let name = data.name;
    if(type === 'user') {
      let convUser = await db.models.player_user.oneAsync({uuid});
      if(!convUser) {
        cb({result: false, msg: '目标用户不存在'});
        db.close();
        return;
      }

      let converse;
      await db.transactionAsync(async () => {
        let user = await db.models.player_user.oneAsync({uuid: player.uuid});
        converse = await db.models.chat_converse.createAsync({
          uuid: generateUUID(),
          type: data.type || 'user',
          name: name || '',
          icon: '',// 在之后可以对多人会话进行icon修改操作
          owner_id: user.id,
        });
        debug('create converse success: %s', JSON.stringify(converse));
        converse.addParticipants([user, convUser], () => {});
        // app.chat.converses[converse.uuid] = Object.assign({}, converse);
        app.chat.addConverse()
      })

      cb({result: true, data: converse});
    } if(type === 'group') {
      debug('创建用户组会话失败。尚未实现');
    } else {
      debug('create converse failed, try to create undefined type of converse: %o', data);
    }

    db.close();
  }catch(err) {
    console.error(err);
    cb({result: false, msg: err.toString()})
  }
}

let removeConverse = async function removeConverse(data, cb, db) {
  let app = this.app;
  let socket = this.socket;

  let player = app.player.list.find(socket);
  if(!player) {
    throw '发生异常，无法获取到用户信息，请检查您的登录状态';
  }
  let user = player.user;
  let converse_uuid = data.converseUUID;
  if(!converse_uuid) {
    throw '缺少必要字段'
  }

  let converse = await db.models.chat_converse.oneAsync({
    'ownerId': user.id,
    'uuid': converse_uuid
  });
  if(!converse) {
    throw '该会话不存在';
  }

  await converse.destroy();
  return true;
}

// 获取多人会话列表
let getConverses = async function getConverses(data, cb, db) {
  let app = this.app;
  let socket = this.socket;

  if(!app.player) {
    throw new Error('[ChatComponent] require component [PlayerComponent]');
  }

  let player = app.player.list.find(socket);
  if(!player) {
    throw '发生异常，无法获取到用户信息，请检查您的登录状态';
  }
  let user = await db.models.player_user.oneAsync({uuid: player.uuid});
  let converses = await user.getConverses();
  return {list: converses};
}

let updateCardChatData = async function updateCardChatData(data, cb, db) {
  const app = this.app;
  const socket = this.socket;
  const Op = app.storage.Op;

  let player = app.player.list.find(socket);
  if(!player) {
    throw '发生异常，无法获取到用户信息，请检查您的登录状态';
  }

  let { chatUUID, newData } = data;
  let log = null;
  // 在内存中查找
  let logs = app.chat.log;
  for (let l of logs) {
    if(l.uuid === chatUUID && l.type === 'card' && (l.sender_uuid === player.uuid || l.to_uuid === player.uuid)) {
      log = l;
    }
  }

  if(!!log) {
    // 在内存中找到
    log.data = Object.assign({}, log.data, newData);
    return {log};
  }

  // 在数据库中查找
  log = await db.models.chat_log.findOne({
    where: {
      uuid: chatUUID,
      type: 'card',
      [Op.or]: [
        { sender_uuid: player.uuid },
        { to_uuid: player.uuid },
      ]
    }
  })

  if(!log) {
    throw '找不到该条系统信息';
  }

  log.data = Object.assign({}, log.data, newData);
  await log.save();
  return {log}
}

// 发送正在输入信号
const startWriting = async function startWriting(data, cb, db) {
  const app = this.app;
  const socket = this.socket;
  const player = app.player.list.find(socket);
  if(!player) {
    throw '发生异常，无法获取到用户信息，请检查您的登录状态';
  }

  const {
    type = 'user',
    uuid,
  } = data;

  const from_uuid = player.uuid;
  const to_uuid = uuid;

  if(type === 'user') {
    // 对user发送的信息
    const other = app.player.list.get(to_uuid);
    if(other) {
      // 如果该用户在线，则对该用户发送信息
      other.socket.emit('chat::startWriting', {type, from: from_uuid});
    }
  }
}

// 发送停止输入信号
const stopWriting = async function stopWriting(data, cb, db) {
  const app = this.app;
  const socket = this.socket;
  const player = app.player.list.find(socket);
  if(!player) {
    throw '发生异常，无法获取到用户信息，请检查您的登录状态';
  }

  const {
    type = 'user',
    uuid,
  } = data;

  const from_uuid = player.uuid;
  const to_uuid = uuid;

  if(type === 'user') {
    // 对user发送的信息
    const other = app.player.list.get(to_uuid);
    if(other) {
      // 如果该用户在线，则对该用户发送信息
      other.socket.emit('chat::stopWriting', {type, from: from_uuid});
    }
  }
}

exports.addChatLog = addChatLog;
exports.message = message;
exports.getConverses = getConverses;
exports.createConverse = createConverse;
exports.removeConverse = removeConverse;
// exports.getChatLog = getChatLog;
exports.getUserChatLog = getUserChatLog;
exports.getConverseChatLog = getConverseChatLog;
exports.getAllUserConverse = getAllUserConverse;
exports.getOfflineUserConverse = getOfflineUserConverse;
exports.updateCardChatData = updateCardChatData;
exports.startWriting = startWriting;
exports.stopWriting = stopWriting;
