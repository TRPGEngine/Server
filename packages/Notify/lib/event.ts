import { EventFunc } from 'trpg/core';
import { NotifyJPush } from './models/jpush';
import { NotifyUPush } from './models/upush';
import { PlayerSettings } from 'packages/Player/lib/models/settings';
import _ from 'lodash';

// 绑定通知信息: 极光推送
export const bindJPushNotifyInfo: EventFunc<{
  info: {
    userUUID: string;
    registrationID: string;
  };
}> = async function(data, cb, db) {
  const { app, socket } = this;
  const info = data.info;
  const { userUUID, registrationID } = info;
  if (!userUUID || !registrationID) {
    throw '缺少必要字段';
  }

  const player = app.player.list.find(socket);
  if (!player) {
    throw '尚未登录';
  }
  const selfUUID = player.uuid;
  const userId = player.user.id;
  if (selfUUID !== userUUID) {
    throw '非法操作, UUID不匹配';
  }

  const jpushInfo = await NotifyJPush.findOne({
    where: {
      registration_id: registrationID,
    },
  });
  if (!jpushInfo) {
    // 如果当前设备没有记录,则创建
    await NotifyJPush.create({
      registration_id: registrationID,
      user_uuid: userUUID,
      is_active: true,
      userId,
    });

    // TODO: 如果是安卓的话需要给用户发送一条系统通知来提示开启自启动来保证用户能接收到信息
  } else {
    // 否则，更新user_uuid
    jpushInfo.user_uuid = userUUID;
    jpushInfo.userId = userId;
    jpushInfo.is_active = true;
    jpushInfo.save();
  }

  return true;
};

// 绑定友盟推送
export const bindUPushNotifyInfo: EventFunc<{
  info: {
    userUUID: string;
    registrationID: string;
  };
}> = async function(data, cb, db) {
  const { app, socket } = this;
  const { userUUID, registrationID } = data.info;

  if (!userUUID || !registrationID) {
    throw '缺少必要字段';
  }

  const player = app.player.list.find(socket);
  if (!player) {
    throw '尚未登录';
  }
  const selfUUID = player.uuid;
  const userId = player.user.id;

  if (selfUUID !== userUUID) {
    throw '非法操作, UUID不匹配';
  }

  const upushInfo = await NotifyUPush.findOne({
    where: {
      registration_id: registrationID,
    },
  });
  if (!upushInfo) {
    // 没有记录则创建
    await NotifyUPush.create({
      registration_id: registrationID,
      user_uuid: userUUID,
      is_active: true,
      userId,
    });
  } else {
    // 否则则更新
    upushInfo.user_uuid = userUUID;
    upushInfo.userId = userId;
    upushInfo.is_active = true;
    upushInfo.save();
  }

  return true;
};

/**
 * 启用推送通知
 */
export const activeNofifyEvent: EventFunc<{
  info: {
    userUUID: string;
    registrationID: string;
  };
}> = async function(data, cb, db) {
  const userUUID = _.get(data, 'info.userUUID', '');
  const registrationID = _.get(data, 'info.registrationID');

  const setting = await PlayerSettings.getByUserUUID(userUUID);
  const upush = await NotifyUPush.findByRegistrationAndUserUUID(
    registrationID,
    userUUID
  );

  if (_.isNil(upush) || _.isNil(setting)) {
    throw new Error('没有对应记录, 无法启用');
  }

  await setting.setSystemSetting('disableNotify', false);
  upush.is_active = true;
  await upush.save();
  return true;
};

/**
 * 取消推送通知
 * 操作: 在该用户的通知设置上设置不推送。取消该设备的绑定性
 */
export const deactiveNofifyEvent: EventFunc<{
  info: {
    userUUID: string;
    registrationID: string;
  };
}> = async function(data, cb, db) {
  const userUUID = _.get(data, 'info.userUUID', '');
  const registrationID = _.get(data, 'info.registrationID');

  const setting = await PlayerSettings.getByUserUUID(userUUID);
  const upush = await NotifyUPush.findByRegistrationAndUserUUID(
    registrationID,
    userUUID
  );

  if (_.isNil(upush) || _.isNil(setting)) {
    throw new Error('没有对应记录, 无法取消');
  }

  await setting.setSystemSetting('disableNotify', true);
  upush.is_active = false;
  await upush.save();
  return true;
};
