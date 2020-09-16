/**
 * 这里放一些依赖Group的会话事件
 * 因为Group依赖Chat但Chat不依赖Group
 */

import { EventFunc } from 'trpg/core';
import { GroupChannel } from './models/channel';

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
    throw new Error('发生异常，无法获取到用户信息，请检查您的登录状态');
  }

  const { type = 'user', uuid, currentText } = data;

  const from_uuid = player.uuid;
  const to_uuid = uuid;

  if (type === 'user') {
    // 对user发送的信息
    app.player.manager.unicastSocketEvent(to_uuid, 'chat::startWriting', {
      type,
      from: from_uuid,
    });
  } else if (type === 'group') {
    // 对group群发消息
    app.player.manager.roomcastSocketEvent(to_uuid, 'chat::startWriting', {
      type,
      from: from_uuid,
      groupUUID: to_uuid,
      currentText,
    });
  } else if (type === 'channel') {
    // 先获取频道的相关groupUUID再通过groupUUID群发信息
    const groupUUID = await GroupChannel.getChannelGroupUUID(to_uuid);

    app.player.manager.roomcastSocketEvent(groupUUID, 'chat::startWriting', {
      type,
      from: from_uuid,
      groupUUID,
      channelUUID: to_uuid,
      currentText,
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
    throw new Error('发生异常，无法获取到用户信息，请检查您的登录状态');
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
  } else if (type === 'group') {
    // 对group群发消息
    app.player.manager.roomcastSocketEvent(to_uuid, 'chat::stopWriting', {
      type,
      from: from_uuid,
      groupUUID: to_uuid,
    });
  } else if (type === 'channel') {
    // 先获取频道的相关groupUUID再通过groupUUID群发信息
    const groupUUID = await GroupChannel.getChannelGroupUUID(to_uuid);

    app.player.manager.roomcastSocketEvent(groupUUID, 'chat::stopWriting', {
      type,
      from: from_uuid,
      groupUUID,
      channelUUID: to_uuid,
    });
  }
};
