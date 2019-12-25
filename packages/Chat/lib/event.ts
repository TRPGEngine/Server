import Debug from 'debug';
const debug = Debug('trpg:component:chat:event');
import generateUUID from 'uuid/v4';
import _ from 'lodash';
import { ChatMessagePartial } from '../types/message';
import { ChatLog } from './models/log';
import { EventFunc } from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';

/**
 * 增加聊天消息
 * @todo 待将所有addChatLog转到ChatLog.appendCachedChatLog
 * @param payload 消息内容
 */
export const addChatLog = function addChatLog(
  payload: ChatMessagePartial
): ChatMessagePartial | false {
  if (!!payload) {
    return ChatLog.appendCachedChatLog(payload);
  } else {
    return false;
  }
};

/**
 * 获取某一用户与当前用户的聊天记录
 */
export const getUserChatLog: EventFunc = async function getUserChatLog(
  data,
  cb,
  db
) {
  const app = this.app;
  const socket = this.socket;

  const Op = app.storage.Op;
  let userUUID = data.user_uuid;
  let offsetDate = data.offsetDate || '';
  let limit = data.limit || 10;

  if (!userUUID) {
    throw '缺少必要参数';
  }

  let player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '尚未登录';
  }
  let selfUUID = player.uuid;
  // IDEA: 定义: 获取用户间会话记录时无视掉自身发送的tip类型信息
  let where = {
    converse_uuid: null,
    [Op.or]: [
      { sender_uuid: userUUID, to_uuid: selfUUID },
      { sender_uuid: selfUUID, to_uuid: userUUID, type: { [Op.ne]: 'tip' } },
    ],
  };

  let list = [];
  let nomore = false;
  if (!offsetDate) {
    // 初始获取聊天记录
    let logs = await db.models.chat_log.findAll({
      where,
      limit,
      order: [['date', 'DESC']],
    });
    if (logs.length < limit) {
      // 如果取到的数据量少于限制，则表示没有更多数据了
      nomore = true;
    }
    list = list.concat(logs);
    // 获取缓存中的聊天记录
    const logList = await ChatLog.getCachedChatLog();
    for (const log of logList) {
      if (
        !log.converse_uuid &&
        ((log.sender_uuid === userUUID && log.to_uuid === selfUUID) ||
          (log.sender_uuid === selfUUID &&
            log.to_uuid === userUUID &&
            log.type !== 'tip'))
      ) {
        list.push(log);
        continue;
      }
    }
  } else {
    where['date'] = {
      [Op.lte]: new Date(offsetDate),
    };
    let logs = await db.models.chat_log.findAll({
      where,
      limit,
      order: [['date', 'DESC']],
    });
    if (logs.length < limit) {
      // 如果取到的数据量少于限制，则表示没有更多数据了
      nomore = true;
    }
    list = list.concat(logs);
  }
  return { list, nomore };
};

/**
 * 获取会话聊天记录
 */
export const getConverseChatLog: EventFunc = async function getConverseChatLog(
  data,
  cb,
  db
) {
  const app = this.app;
  const socket = this.socket;
  const Op = app.storage.Op;
  let converse_uuid = data.converse_uuid;
  let offsetDate = data.offsetDate || '';
  let limit = data.limit || 10;
  if (!converse_uuid) {
    throw '缺少必要参数';
  }

  let player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '尚未登录';
  }
  let selfUUID = player.uuid;

  let list = [];
  let nomore = false;
  let where = {
    converse_uuid,
    [Op.or]: [
      // 只会获取非私聊，或者会话中私聊给自己的信息
      { to_uuid: null },
      { to_uuid: '' },
      { to_uuid: selfUUID },
    ],
  };
  if (!offsetDate) {
    // 初始获取聊天记录
    let logs = await db.models.chat_log.findAll({
      where,
      limit,
      order: [['date', 'DESC']],
    });
    if (logs.length < limit) {
      // 如果取到的数据量少于限制，则表示没有更多数据了
      nomore = true;
    }
    list = list.concat(logs);
    // 获取缓存中的聊天记录
    const logList = await ChatLog.getCachedChatLog();
    for (let log of logList) {
      if (
        log.converse_uuid === converse_uuid &&
        (!log.to_uuid || log.to_uuid == selfUUID)
      ) {
        list.push(log);
        continue;
      }
    }
  } else {
    where['date'] = {
      [Op.lte]: new Date(offsetDate),
    };
    let logs = await db.models.chat_log.findAll({
      where,
      limit,
      order: [['date', 'DESC']],
    });
    if (logs.length < limit) {
      // 如果取到的数据量少于限制，则表示没有更多数据了
      nomore = true;
    }
    list = list.concat(logs);
  }
  return { list, nomore };
};

export const getAllUserConverse: EventFunc = async function getAllUserConverse(
  data,
  cb,
  db
) {
  const app = this.app;
  const socket = this.socket;
  const Op = app.storage.Op;

  let player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '尚未登录';
  }

  let senders = [];
  // 获取缓存中的会话列表
  const logList = await ChatLog.getCachedChatLog();
  for (let log of logList) {
    if (
      !/^trpg/.test(log.sender_uuid) &&
      log.to_uuid === player.uuid &&
      log.converse_uuid == null &&
      log.is_group === false
    ) {
      senders.push(log.sender_uuid);
    } else if (
      !/^trpg/.test(log.to_uuid) &&
      log.sender_uuid === player.uuid &&
      log.converse_uuid == null &&
      log.is_group === false
    ) {
      senders.push(log.to_uuid);
    }
  }

  let ret1 = await db.models.chat_log
    .aggregate('sender_uuid' as any, 'DISTINCT', {
      where: {
        sender_uuid: { [Op.notLike]: 'trpg%' },
        to_uuid: player.uuid,
        converse_uuid: null,
        is_group: false,
      },
      plain: false,
    })
    .then((list) => list.map((item) => item['DISTINCT']));
  let ret2 = await db.models.chat_log
    .aggregate('to_uuid' as any, 'DISTINCT', {
      where: {
        sender_uuid: player.uuid,
        to_uuid: { [Op.notLike]: 'trpg%' },
        converse_uuid: null,
        is_group: false,
      },
      plain: false,
    })
    .then((list) => list.map((item) => item['DISTINCT']));
  senders = [...senders, ...ret1, ...ret2];
  // 数组去重与过滤
  senders = Array.from(new Set(senders)).filter(Boolean);
  return { senders };
};

export const getOfflineUserConverse: EventFunc = async function getOfflineUserConverse(
  data,
  cb,
  db
) {
  const app = this.app;
  const socket = this.socket;
  const Op = app.storage.Op;
  let lastLoginDate = data.lastLoginDate;
  if (!lastLoginDate) {
    throw '缺少必要参数';
  }

  let player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '尚未登录';
  }
  let senders = [];

  // 获取缓存中的聊天记录
  const logList = await ChatLog.getCachedChatLog();
  for (let log of logList) {
    if (
      new Date(log.date) > new Date(lastLoginDate) &&
      !/^trpg/.test(log.sender_uuid) &&
      log.to_uuid === player.uuid &&
      log.converse_uuid == null &&
      log.is_group === false
    ) {
      senders.push(log.sender_uuid);
    } else if (
      new Date(log.date) > new Date(lastLoginDate) &&
      !/^trpg/.test(log.to_uuid) &&
      log.sender_uuid === player.uuid &&
      log.converse_uuid == null &&
      log.is_group === false
    ) {
      senders.push(log.to_uuid);
    }
  }

  let dateCond = { [Op.gte]: new Date(lastLoginDate) };
  let ret1 = await db.models.chat_log
    .aggregate('sender_uuid' as any, 'DISTINCT', {
      where: {
        sender_uuid: { [Op.notLike]: 'trpg%' },
        to_uuid: player.uuid,
        converse_uuid: null,
        date: dateCond,
        is_group: false,
      },
      plain: false,
    })
    .then((list) => list.map((item) => item['DISTINCT']));
  let ret2 = await db.models.chat_log
    .aggregate('to_uuid' as any, 'DISTINCT', {
      where: {
        sender_uuid: player.uuid,
        to_uuid: { [Op.notLike]: 'trpg%' },
        converse_uuid: null,
        date: dateCond,
        is_group: false,
      },
      plain: false,
    })
    .then((list) => list.map((item) => item['DISTINCT']));
  senders = [...senders, ...ret1, ...ret2];
  // 数组去重与过滤
  senders = Array.from(new Set(senders)).filter(Boolean);
  return { senders };
};

export const message: EventFunc = async function message(data, cb) {
  const app = this.app;

  const player = app.player;
  let message = data.message;
  message = app.xss.filterXSS(message); // 将传输的信息进行xss处理 // TODO: 可能需要处理单独的发送< 与 > 的情况
  const sender_uuid = data.sender_uuid;
  const to_uuid = data.to_uuid;
  const converse_uuid = data.converse_uuid;
  const type = data.type || 'normal';
  const is_public = data.is_public || false;
  const is_group = data.is_group || false;
  const date = data.date;
  const _uuid = generateUUID();
  const _data = data.data || null;
  const _pkg = {
    message,
    sender_uuid,
    to_uuid,
    converse_uuid,
    type,
    is_public,
    is_group,
    date,
    uuid: _uuid,
    data: _data,
  };

  debug('[用户#%s]: %s', sender_uuid, message);
  if (!!message) {
    const pkg = addChatLog.call(app, _pkg);
    if (!pkg) {
      cb({ result: false, msg: '信息服务出现异常' });
      return;
    }

    if (!is_public) {
      // 仅个人可见
      if (sender_uuid !== to_uuid) {
        // 私聊
        const isOnline = await player.manager.checkPlayerOnline(to_uuid);
        if (isOnline) {
          player.manager.unicastSocketEvent(to_uuid, 'chat::message', pkg);
        } else {
          debug('[用户:%s]: 接收方%s不在线', sender_uuid, to_uuid);
          app.chat.tryNotify(pkg);
        }
      }
    } else {
      // 所有人可见
      if (!is_group) {
        // 公聊
        player.manager.broadcastSocketEvent('chat::message', pkg);
      } else {
        // 群聊
        player.manager.roomcastSocketEvent(converse_uuid, 'chat::message', pkg);
      }
    }
    cb({ result: true, pkg });
  } else {
    cb({ result: false, msg: '聊天内容不能为空' });
  }
};

/**
 * 撤回消息
 */
export const revokeMsg: EventFunc<{
  messageUUID: string;
}> = async function revokeMsg(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('发生异常，无法获取到用户信息，请检查您的登录状态');
  }

  const messageUUID = data.messageUUID;
  if (_.isNil(messageUUID)) {
    throw new Error('缺少必要字段');
  }

  await ChatLog.revokeMsg(messageUUID, player.uuid);

  return true;
};

export const removeConverse: EventFunc = async function removeConverse(
  data,
  cb,
  db
) {
  let app = this.app;
  let socket = this.socket;

  let player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '发生异常，无法获取到用户信息，请检查您的登录状态';
  }
  const user = await PlayerUser.findByUUID(player.uuid);
  let converse_uuid = data.converseUUID;
  if (!converse_uuid) {
    throw '缺少必要字段';
  }

  let converse = await db.models.chat_converse.findOne({
    where: {
      ownerId: user.id,
      uuid: converse_uuid,
    },
  });
  if (!converse) {
    throw '该会话不存在';
  }

  await converse.destroy();
  return true;
};

/**
 * 获取多人会话列表
 */
export const getConverses: EventFunc = async function getConverses(
  data,
  cb,
  db
) {
  let app = this.app;
  let socket = this.socket;

  if (!app.player) {
    throw new Error('[ChatComponent] require component [PlayerComponent]');
  }

  let player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '发生异常，无法获取到用户信息，请检查您的登录状态';
  }
  let user = await db.models.player_user.findOne({
    where: { uuid: player.uuid },
  });
  let converses = await user.getConverses();
  return { list: converses };
};

/**
 * 更新卡片消息内置数据
 */
export const updateCardChatData: EventFunc = async function updateCardChatData(
  data,
  cb,
  db
) {
  const app = this.app;
  const socket = this.socket;
  const Op = app.storage.Op;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '发生异常，无法获取到用户信息，请检查您的登录状态';
  }

  const { chatUUID, newData } = data;
  let log = null;
  // 在内存中查找
  const logs = await ChatLog.getCachedChatLog();
  for (let l of logs) {
    if (
      l.uuid === chatUUID &&
      l.type === 'card' &&
      (l.sender_uuid === player.uuid || l.to_uuid === player.uuid)
    ) {
      log = l;
    }
  }

  if (!!log) {
    // 在内存中找到
    log.data = Object.assign({}, log.data, newData);
    return { log };
  }

  // 在数据库中查找
  log = await db.models.chat_log.findOne({
    where: {
      uuid: chatUUID,
      type: 'card',
      [Op.or]: [{ sender_uuid: player.uuid }, { to_uuid: player.uuid }],
    },
  });

  if (!log) {
    throw '找不到该条系统信息';
  }

  log.data = Object.assign({}, log.data, newData);
  await log.save();
  return { log };
};

/**
 * 发送正在输入信号
 */
export const startWriting: EventFunc = async function startWriting(
  data,
  cb,
  db
) {
  const app = this.app;
  const socket = this.socket;
  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '发生异常，无法获取到用户信息，请检查您的登录状态';
  }

  const { type = 'user', uuid } = data;

  const from_uuid = player.uuid;
  const to_uuid = uuid;

  if (type === 'user') {
    // 对user发送的信息
    app.player.manager.unicastSocketEvent(to_uuid, 'chat::startWriting', {
      type,
      from: from_uuid,
    });
  }
};

/**
 * 发送停止输入信号
 */
export const stopWriting: EventFunc = async function stopWriting(data, cb, db) {
  const app = this.app;
  const socket = this.socket;
  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '发生异常，无法获取到用户信息，请检查您的登录状态';
  }

  const { type = 'user', uuid } = data;

  const from_uuid = player.uuid;
  const to_uuid = uuid;

  if (type === 'user') {
    // 对user发送的信息
    app.player.manager.unicastSocketEvent(to_uuid, 'chat::stopWriting', {
      type,
      from: from_uuid,
    });
  }
};
