import { EventFunc } from 'trpg/core';

export const bindAttachUUID: EventFunc = async function(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '用户不存在，请检查登录状态';
  }

  let avatar_uuid = data.avatar_uuid;
  let attach_uuid = data.attach_uuid;

  let avatar = await db.models.file_avatar.findOne({
    where: { uuid: avatar_uuid },
  });
  avatar.attach_uuid = attach_uuid;
  await avatar.save();
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
