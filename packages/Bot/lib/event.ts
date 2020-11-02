import { EventFunc } from 'trpg/core';
import _ from 'lodash';
import { BotApp } from './models/app';
import { autoJoinSocketRoom } from 'packages/Player/lib/managers/socketroom-manager';
import { getSocketIp } from 'packages/Core/lib/utils/socket-helper';

/**
 * 机器人应用登录
 */
export const appLogin: EventFunc<{
  appKey: string;
  appSecret: string;
  deviceInfo: object;
}> = async function (data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const { appKey, appSecret, deviceInfo } = data;

  const { bot, user } = await BotApp.findAppUser(appKey, appSecret);
  if (user.banned === true) {
    throw new Error('您已被封禁');
  }

  // 加入到列表中
  const loginResult = await app.player.manager.addPlayer(
    user.uuid,
    socket,
    'cli'
  );
  if (!loginResult) {
    throw new Error('登录失败: 锁已经被占用, 请稍后再试');
  }

  await autoJoinSocketRoom(app, socket);

  cb({
    result: true,
    bot: bot,
    user: user.getInfo(true),
  });

  const ip = getSocketIp(socket);
  await user.recordLoginLog({
    type: 'internal',
    socket_id: socket.id,
    channel: 'bot_app',
    ip,
    platform: 'cli',
    device_info: {
      userAgent: _.get(socket, 'handshake.headers.user-agent'),
      acceptLanguage: _.get(socket, 'handshake.headers.accept-language'),
      ...deviceInfo,
    },
  });
};
