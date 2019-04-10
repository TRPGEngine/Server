exports.bindAttachUUID = async function(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  let player = app.player.list.find(socket);
  if(!player) {
    throw '用户不存在，请检查登录状态';
  }

  let avatar_uuid = data.avatar_uuid;
  let attach_uuid = data.attach_uuid;

  let avatar = await db.models.file_avatar.oneAsync({uuid: avatar_uuid});
  avatar.attach_uuid = attach_uuid;
  await avatar.saveAsync();
  return {
    avatar: avatar.getObject()
  }
}

exports.getFileInfo = async function(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  let uuid = data.uuid;
  let host = app.get('apihost');

  let info = await db.models.file_file.oneAsync({uuid});
  return Object.assign({}, info.getObject(), {
    downloadUrl: host + info.getDownloadUrl(),
    previewUrl: info.getPreviewUrl(host),
  })
}
