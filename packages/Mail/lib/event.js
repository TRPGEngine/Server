const debug = require('debug')('trpg:component:mail:event');
const querystring = require('querystring');
const utils = require('./utils');

function getHost(socket) {
  const defaultHost = 'trpgapi.moonrailgun.com';
  let host = '';
  if (
    socket &&
    socket.handshake &&
    socket.handshake.headers &&
    socket.handshake.headers.host
  ) {
    host = socket.handshake.headers.host;
  }
  return host || defaultHost;
}

function generateMailHash(mailListObj) {
  const app = this;
  return app.mail.encryption(
    JSON.stringify(
      Object.assign({}, mailListObj, { timestamp: new Date().getTime() })
    )
  );
}

exports.bindMail = async function bindMail(data, cb, db) {
  const { app, socket } = this;
  const fromMail = app.get('mail.smtp.auth.user');

  if (!app.player) {
    debug('[MailComponent] need [PlayerComponent]');
    return;
  }
  let player = app.player.list.find(socket);
  if (!player) {
    throw '用户不存在，请检查登录状态';
  }
  let userUUID = player.uuid;

  let { address } = data;
  if (!address) {
    throw '缺少参数';
  }

  let isExists = await db.models.mail_list.existsAsync({
    user_uuid: userUUID,
    enabled: true,
  });
  if (isExists) {
    throw '已绑定邮箱, 如需绑定新邮箱请先解绑';
  }

  // TODO: 需要增加限制处理，防止被识别为垃圾邮件
  // TODO: 需要对多次发起同一请求进行处理
  let mail = await db.models.mail_list.createAsync({
    user_uuid: userUUID,
    email_address: address,
    ownerId: player.user.id,
  });

  const subject = '绑定TRPG账户电子邮箱';
  const template = require('./views/validate.marko');
  const host = getHost(socket);
  const link =
    `http://${host}/mail/validate/_bind?` +
    querystring.stringify({
      user_uuid: userUUID,
      hash: generateMailHash.call(app, mail),
      email_address: mail.email_address,
    });
  const body = template.renderToString({
    title: subject,
    link,
  });

  let res = await app.mail.sendAsync(
    userUUID,
    fromMail,
    mail.email_address,
    subject,
    body
  );
  if (!res.is_success) {
    await mail.removeAsync(); // 如果邮件发送失败，则删除邮件列表里的记录
    throw `邮件发送失败:${res.error}`;
  }

  return true;
};
