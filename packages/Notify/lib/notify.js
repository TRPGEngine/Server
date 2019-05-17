const debug = require('debug')('trpg:component:notify');
const config = require('config').get('notify');
const _ = require('lodash');
const JPush = require('jpush-async').JPushAsync;
const event = require('./event');

module.exports = function NotifyComponent(app) {
  initStorage.call(app);
  initFunction.call(app);
  initSocket.call(app);

  return {
    name: 'NotifyComponent',
    require: ['PlayerComponent', 'ChatComponent'],
  };
};

function initStorage() {
  let app = this;
  let storage = app.storage;
  storage.registerModel(require('./models/jpush.js'));
  storage.registerModel(require('./models/history.js'));

  app.on('initCompleted', function(app) {
    // 数据信息统计
    debug('storage has been load 2 notify db model');
  });
}

function initFunction() {
  const app = this;
  const db = app.storage.db;

  const appkey = _.get(config, 'jpush.appKey');
  const masterSecret = _.get(config, 'jpush.masterSecret');

  if (!appkey || !masterSecret) {
    app.error('init function failed: need jpush info');
    return;
  }

  let _client;
  try {
    _client = JPush.buildClient(config.jpush);
  } catch (e) {
    app.errorWithContext('JPush 初始化失败', e);
    throw e;
  }

  app.notify = {
    JPush,
    _client,
    async addNotifyHistory(options) {
      const ret = await db.models.notify_history.create({
        type: 'jpush',
        ...options,
      });
      return ret;
    },
    async sendNotifyMsg(userUUID, title, msg, options = {}) {
      // TODO: 需要做频率限制与在线监测
      const platform = _.get(options, 'platform', JPush.ALL);
      const audience = _.get(options, 'audience', JPush.alias(userUUID));

      // 增加到history
      app.notify.addNotifyHistory({
        platform: 'all',
        user_uuid: userUUID,
        notification: title,
        message: msg,
      });

      return await _client
        .push()
        .setPlatform(platform)
        .setAudience(audience)
        .setNotification(title, JPush.ios(title), JPush.android(title, null, 1))
        .setMessage(msg)
        .setOptions(null, 60)
        .send();
    },
    async sendNotifyMsgByRegistrationId(
      registrationId,
      title,
      msg,
      options = {}
    ) {
      // TODO: 需要做频率限制与在线监测
      const platform = _.get(options, 'platform', JPush.ALL);
      const audience = _.get(
        options,
        'audience',
        JPush.registration_id(registrationId)
      );

      // 增加到history
      app.notify.addNotifyHistory({
        platform: 'all',
        registration_id: registrationId,
        notification: title,
        message: msg,
      });

      return await _client
        .push()
        .setPlatform(platform)
        .setAudience(audience)
        .setNotification(title, JPush.ios(title), JPush.android(title, null, 1))
        .setMessage(msg)
        .setOptions(null, 60)
        .send();
    },
    async getNotifyInfo(userUUID) {
      return await db.models.notify_jpush.findOne({
        where: {
          user_uuid: userUUID,
        },
      });
    },
  };

  if (_.get(app, 'chat.tryNotify')) {
    const originTryNotify = app.chat.tryNotify;
    app.chat.tryNotify = async (pkg) => {
      originTryNotify(pkg);

      const { message, sender_uuid, to_uuid } = pkg;

      // TODO: 这里要做一步缓存
      const notifyInfo = await app.notify.getNotifyInfo(to_uuid);
      if (notifyInfo && notifyInfo.is_active) {
        // 发送通知
        const senderInfo = await app.player.getUserInfo(sender_uuid);
        await app.notify.sendNotifyMsgByRegistrationId(
          notifyInfo.registration_id,
          `${senderInfo.nickname || senderInfo.username}:`,
          message
        );
        debug('send chat notify finished!');
      }
    };
  }
}

function initSocket() {
  let app = this;
  app.registerEvent('notify::bindNotifyInfo', event.bindNotifyInfo);
}
