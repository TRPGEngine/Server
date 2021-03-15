import Debug from 'debug';
const debug = Debug('trpg:component:chat:event');
import generateUUID from 'uuid/v4';
import _ from 'lodash';
import { ChatMessagePartial, ChatMessagePayload } from '../types/message';
import { ChatLog } from './models/log';
import { EventFunc } from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';
import { isUUID } from 'lib/helper/string-helper';
import { applyMsgInterceptors } from './interceptors';
import { ChatConverse } from './models/converse';
import { ChatConverseAck } from './models/converse-ack';

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
  const userUUID = data.user_uuid;
  const offsetDate = data.offsetDate || '';
  const limit = data.limit || 10;

  if (!userUUID) {
    throw new Error('缺少必要参数');
  }

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('登录状态异常');
  }
  const selfUUID = player.uuid;
  // IDEA: 定义: 获取用户间会话记录时无视掉自身发送的tip类型信息
  // NOTICE:
  // 这里会造成一个问题。就是如果使用消息拦截器进行投骰时因为是系统消息类型
  // 因此会产生刷新后无法看见自己发送的投骰信息的问题
  // TODO: 看看能不能想办法改造成允许查看自己的tip信息
  const where = {
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
    const logs = await ChatLog.findAll({
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
    const logs = await ChatLog.findAll({
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
  const converse_uuid = data.converse_uuid;
  const offsetDate = data.offsetDate || '';
  const limit = data.limit || 10;
  if (!converse_uuid) {
    throw new Error('缺少必要参数');
  }

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('尚未登录');
  }
  const selfUUID = player.uuid;

  let list = [];
  let nomore = false;
  const where = {
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
    let logs = await ChatLog.findAll({
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
    let logs = await ChatLog.findAll({
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
    throw new Error('尚未登录');
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

  const ret1 = await ChatLog.aggregate('sender_uuid' as any, 'DISTINCT', {
    where: {
      sender_uuid: { [Op.notLike]: 'trpg%' },
      to_uuid: player.uuid,
      converse_uuid: null,
      is_group: false,
    },
    plain: false,
  }).then((list) => list.map((item) => item['DISTINCT']));
  const ret2 = await ChatLog.aggregate('to_uuid' as any, 'DISTINCT', {
    where: {
      sender_uuid: player.uuid,
      to_uuid: { [Op.notLike]: 'trpg%' },
      converse_uuid: null,
      is_group: false,
    },
    plain: false,
  }).then((list) => list.map((item) => item['DISTINCT']));
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
  const lastLoginDate = data.lastLoginDate;
  if (!lastLoginDate) {
    throw new Error('缺少必要参数');
  }

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('尚未登录');
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

  const dateCond = { [Op.gte]: new Date(lastLoginDate) };
  const ret1 = await ChatLog.aggregate('sender_uuid' as any, 'DISTINCT', {
    where: {
      sender_uuid: { [Op.notLike]: 'trpg%' },
      to_uuid: player.uuid,
      converse_uuid: null,
      date: dateCond,
      is_group: false,
    },
    plain: false,
  }).then((list) => list.map((item) => item['DISTINCT']));
  const ret2 = await ChatLog.aggregate('to_uuid' as any, 'DISTINCT', {
    where: {
      sender_uuid: player.uuid,
      to_uuid: { [Op.notLike]: 'trpg%' },
      converse_uuid: null,
      date: dateCond,
      is_group: false,
    },
    plain: false,
  }).then((list) => list.map((item) => item['DISTINCT']));
  senders = [...senders, ...ret1, ...ret2];
  // 数组去重与过滤
  senders = Array.from(new Set(senders)).filter(Boolean);
  return { senders };
};

export const message: EventFunc = async function message(data, cb) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('发生异常，无法获取到用户信息，请检查您的登录状态');
  }

  const message = data.message;
  const sender_uuid = player.uuid;
  const to_uuid = data.to_uuid;
  const converse_uuid = data.converse_uuid;
  const group_uuid = data.group_uuid;
  let type = data.type || 'normal';
  const is_public = data.is_public || false;
  const is_group = data.is_group || false;
  const _uuid = generateUUID();
  const _data = data.data || null;

  if (isUUID(sender_uuid) && ChatLog.MESSAGE_TYPE_BLACKLIST.includes(type)) {
    // 如果发送的消息的来源是用户(sender_uuid为UUID)且类型是黑名单消息
    // 则将其强制转化为普通消息
    type = 'normal';
  }

  const _pkg: ChatMessagePayload = {
    message,
    sender_uuid,
    to_uuid,
    converse_uuid,
    group_uuid,
    type,
    is_public,
    is_group,
    date: new Date().toISOString(), // 将消息时间统一成服务端时间
    uuid: _uuid,
    data: _data,
  };

  if (_pkg.is_public === true && _pkg.is_group === false) {
    // 用户不允许广播消息
    // 进行一些数据修正
    if (!_.isNil(_pkg.converse_uuid)) {
      _pkg.is_group = true;
    } else {
      _pkg.is_public = false;
    }
  }

  debug('[用户#%s]: %s', sender_uuid, message);
  if (!!message) {
    const pkg = await ChatLog.sendMsg(await applyMsgInterceptors(_pkg));

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

/**
 * 删除会话
 */
export const removeConverse: EventFunc = async function removeConverse(
  data,
  cb,
  db
) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('发生异常，无法获取到用户信息，请检查您的登录状态');
  }
  const user = await PlayerUser.findByUUID(player.uuid);
  const converse_uuid = data.converseUUID;
  if (!converse_uuid) {
    throw new Error('缺少必要字段');
  }

  const converse = await ChatConverse.findOne({
    where: {
      ownerId: user.id,
      uuid: converse_uuid,
    },
  });
  if (!converse) {
    throw new Error('该会话不存在');
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
  const app = this.app;
  const socket = this.socket;

  if (!app.player) {
    throw new Error('[ChatComponent] require component [PlayerComponent]');
  }

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('发生异常，无法获取到用户信息，请检查您的登录状态');
  }
  const user = await PlayerUser.findByUUID(player.uuid);
  const converses = await user.getConverses();
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
    throw new Error('发生异常，无法获取到用户信息，请检查您的登录状态');
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
  log = await ChatLog.findOne({
    where: {
      uuid: chatUUID,
      type: 'card',
      [Op.or]: [{ sender_uuid: player.uuid }, { to_uuid: player.uuid }],
    },
  });

  if (!log) {
    throw new Error('找不到该条系统信息');
  }

  log.data = Object.assign({}, log.data, newData);
  await log.save();
  return { log };
};

/**
 * 设置会话已收到
 */
export const setConverseAck: EventFunc = async function converseAck(data) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('发生异常，无法获取到用户信息，请检查您的登录状态');
  }

  const { converseUUID, lastLogUUID } = data;

  await ChatConverseAck.setConverseAck(player.uuid, converseUUID, lastLogUUID);

  return true;
};
