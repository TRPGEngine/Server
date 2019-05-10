exports.bindNotifyInfo = async function(data, cb, db) {
  const { app, socket } = this;
  const info = data.info;
  const { userUUID, registrationID, userTags } = info;
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

  const jpushInfo = await db.models.notify_jpush.findOne({
    where: {
      registration_id: registrationID,
    },
  });
  if (!jpushInfo) {
    // 如果当前设备没有记录,则创建
    await db.models.notify_jpush.create({
      registration_id: registrationID,
      user_uuid: userUUID,
      is_active: true,
      userId,
    });
  } else {
    // 否则，更新user_uuid
    jpushInfo.user_uuid = userUUID;
    jpushInfo.userId = userId;
    jpushInfo.is_active = true;
    jpushInfo.save();
  }

  return true;
};
