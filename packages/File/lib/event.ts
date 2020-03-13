import { EventFunc } from 'trpg/core';
import { FileAvatar } from './models/avatar';
import _ from 'lodash';

export const bindAttachUUID: EventFunc<{
  avatar_uuid: string;
  attach_uuid: string;
}> = async function(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const avatar_uuid = data.avatar_uuid;
  const attach_uuid = data.attach_uuid;

  if (_.isNil(avatar_uuid) || _.isNil(attach_uuid)) {
    throw new Error('缺少必要参数');
  }

  const avatar = await FileAvatar.bindAttachUUID(
    avatar_uuid,
    attach_uuid,
    player.uuid
  );

  return {
    avatar: avatar.getObject(),
  };
};

export const getFileInfo = async function(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  let uuid = data.uuid;
  let host = app.get('apihost');

  let info = await db.models.file_file.findOne({ where: { uuid } });
  return Object.assign({}, info.getObject(), {
    downloadUrl: host + info.getDownloadUrl(),
    previewUrl: info.getPreviewUrl(host),
  });
};
