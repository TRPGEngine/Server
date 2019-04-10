const debug = require('debug')('trpg:component:dice:event');

const rolldiceAsync = async function(data) {
  let app = this;
  let {
    sender_uuid,
    to_uuid,
    converse_uuid,
    is_group,
    is_private,
    dice_request,
  } = data;

  let dice = app.dice.roll(dice_request);
  let dice_expression = dice.str;
  let dice_result = dice.value;
  to_uuid = is_group ? converse_uuid : to_uuid;
  debug('user[%s] roll dice in [%s]:\n%s', sender_uuid, to_uuid, dice_expression);

  let db = app.storage.db;
  let log = await db.models.dice_log.create({
    sender_uuid,
    to_uuid,
    is_group,
    is_private,
    dice_request,
    dice_expression,
    dice_result,
    date: new Date(),
  });
  return log;
}

exports.roll = async function roll(data, cb) {
  const app = this.app;
  const socket = this.socket;

  let player = app.player.list.find(socket);
  if(!player) {
    throw '用户不存在，请检查登录状态';
  }

  let { is_group, to_uuid } = data;
  let log = await rolldiceAsync.call(app, data);

  if(is_group) {
    socket.broadcast.to(to_uuid).emit('dice::roll', log);
  }else {
    socket.broadcast.emit('dice::roll', log);
  }

  return {log};
}

exports.sendDiceRequest = async function sendDiceRequest(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  let player = app.player.list.find(socket);
  if(!player) {
    throw '用户不存在，请检查登录状态';
  }
  let sender_uuid = player.user.uuid;
  let {to_uuid, is_group, dice_request, reason} = data;
  if(!to_uuid || is_group === undefined || !dice_request) {
    throw '缺少必要参数';
  }
  // 允许同意请求的用户uuid列表
  let allow_accept_list = [];
  if(!is_group) {
    allow_accept_list = [to_uuid];
  }else {
    allow_accept_list = await app.group.getGroupManagersUUIDAsync(to_uuid);
  }

  // 发送信息
  let converse_uuid = is_group ? to_uuid : null;
  to_uuid = is_group ? null : to_uuid; // 覆写to_uuid
  let chatLog = app.chat.sendMsg(sender_uuid, to_uuid, {
    message: `${player.user.getName()} 因为 ${reason} 请求投骰: ${dice_request}`,
    converse_uuid,
    type: 'card',
    is_public: is_group,
    is_group,
    data: {
      type: 'diceRequest',
      title: '投骰请求',
      is_accept: false,
      dice_request,
      allow_accept_list,
    }
  })
  return {pkg: chatLog}
}

exports.acceptDiceRequest = async function acceptDiceRequest(data, cb) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.list.find(socket);
  if(!player) {
    throw '用户不存在，请检查登录状态';
  }

  let msg_card_uuid = data.msg_card_uuid;
  let diceRequestMsgInfo = await app.chat.findMsgAsync(msg_card_uuid);
  if(diceRequestMsgInfo && diceRequestMsgInfo.data && diceRequestMsgInfo.data.type === 'diceRequest') {
    if(diceRequestMsgInfo.data.is_accept === true) {
      throw '该请求已同意';
    }

    // 接受权限检测
    let playerUUID = player.uuid;
    if(diceRequestMsgInfo.data.allow_accept_list && diceRequestMsgInfo.data.allow_accept_list.indexOf(playerUUID) === -1) {
      throw '您没有同意请求的权限';
    }

    diceRequestMsgInfo.data.is_accept = true;
    let chat_log = await app.chat.updateMsgAsync(diceRequestMsgInfo.uuid, diceRequestMsgInfo);
    let rollResult = await rolldiceAsync.call(app, {
      sender_uuid: diceRequestMsgInfo.sender_uuid,
      to_uuid: diceRequestMsgInfo.to_uuid,
      converse_uuid: diceRequestMsgInfo.converse_uuid,
      is_group: diceRequestMsgInfo.is_group,
      is_private: !diceRequestMsgInfo.is_public,
      dice_request: diceRequestMsgInfo.data.dice_request,
    })
    app.dice.sendDiceResult(
      rollResult.sender_uuid,
      rollResult.to_uuid,
      rollResult.is_group,
      chat_log.message + ' 结果:' + rollResult.dice_expression
    );
    return {log: chat_log};
  }else {
    throw '非法数据';
  }
}

exports.sendDiceInvite = async function sendDiceInvite(data, cb) {
  const app = this.app;
  const socket = this.socket;

  let player = app.player.list.find(socket);
  if(!player) {
    throw '用户不存在，请检查登录状态';
  }
  let sender_uuid = player.user.uuid;
  let {
    to_uuid,
    is_group,
    dice_request,
    reason,
    inviteUUIDList,
    inviteNameList
  } = data;
  if(!to_uuid || is_group === undefined || !dice_request) {
    throw '缺少必要参数';
  }
  if(!inviteNameList) {
    inviteNameList = [];
  }

  // 发送信息
  let converse_uuid = is_group ? to_uuid : null;
  to_uuid = is_group ? null : to_uuid; // 覆写to_uuid
  let chatLog = app.chat.sendMsg(sender_uuid, to_uuid, {
    message: `${player.user.getName()} 因为 ${reason} 邀请 ${inviteNameList.join(',')} 投骰: ${dice_request}`,
    converse_uuid,
    type: 'card',
    is_public: is_group,
    is_group,
    data: {
      type: 'diceInvite',
      title: '投骰邀请',
      is_accept_list: [],
      dice_request,
      allow_accept_list: inviteUUIDList,
    }
  })
  return {pkg: chatLog};
}

exports.acceptDiceInvite = async function acceptDiceInvite(data, cb) {
  const app = this.app;
  const socket = this.socket;

  let player = app.player.list.find(socket);
  if(!player) {
    throw '用户不存在，请检查登录状态';
  }

  let playerUUID = player.uuid;
  let msg_card_uuid = data.msg_card_uuid;
  let diceInviteMsgInfo = await app.chat.findMsgAsync(msg_card_uuid);
  if(diceInviteMsgInfo && diceInviteMsgInfo.data && diceInviteMsgInfo.data.type === 'diceInvite') {
    if(diceInviteMsgInfo.data.is_accept_list && diceInviteMsgInfo.data.is_accept_list.indexOf(playerUUID) >= 0) {
      throw '该请求已同意';
    }

    // 接受权限检测
    if(diceInviteMsgInfo.data.allow_accept_list && diceInviteMsgInfo.data.allow_accept_list.indexOf(playerUUID) === -1) {
      throw '您没有同意请求的权限';
    }

    diceInviteMsgInfo.data.is_accept_list.push(playerUUID);
    let chat_log = await app.chat.updateMsgAsync(diceInviteMsgInfo.uuid, diceInviteMsgInfo);
    let rollResult = await rolldiceAsync.call(app, {
      sender_uuid: diceInviteMsgInfo.sender_uuid,
      to_uuid: diceInviteMsgInfo.to_uuid,
      converse_uuid: diceInviteMsgInfo.converse_uuid,
      is_group: diceInviteMsgInfo.is_group,
      is_private: !diceInviteMsgInfo.is_public,
      dice_request: diceInviteMsgInfo.data.dice_request,
    })
    app.dice.sendDiceResult(rollResult.sender_uuid, rollResult.to_uuid, rollResult.is_group, chat_log.message + ' 结果:' + rollResult.dice_expression);
    return {log: chat_log}
  }else {
    throw '非法数据';
  }
}

exports.sendQuickDice = async function sendQuickDice(data, cb, db) {
  let app = this.app;
  let socket = this.socket;

  let player = app.player.list.find(socket);
  if(!player) {
    throw '用户不存在，请检查登录状态';
  }

  let sender_uuid = player.user.uuid;
  let {to_uuid, is_group, dice_request} = data;
  if(!to_uuid || is_group === undefined || !dice_request) {
    throw '缺少必要参数';
  }

  let pkg = {
    sender_uuid,
    is_group: is_group,
    is_private: !is_group,
    dice_request
  }
  if(is_group) {
    pkg.converse_uuid = to_uuid; // 团信息
  }else {
    pkg.to_uuid = to_uuid; // 用户信息
  }
  let rollResult = await rolldiceAsync.call(app, pkg);
  let message = `${player.user.getName()} 发起快速投骰 结果: ${rollResult.dice_expression}`;
  app.dice.sendDiceResult(rollResult.sender_uuid, rollResult.to_uuid, rollResult.is_group, message);

  return true;
}
