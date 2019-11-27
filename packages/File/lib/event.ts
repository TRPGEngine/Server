import { EventFunc } from 'trpg/core';
import { FileAvatar } from './models/avatar';

export const bindAttachUUID: EventFunc = async function(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '用户不存在，请检查登录状态';
  }

  const avatar_uuid = data.avatar_uuid;
  const attach_uuid = data.attach_uuid;

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
