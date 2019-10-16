import Debug from 'debug';
const debug = Debug('trpg:component:notify');
import NotifyHistoryDefinition from './models/history';
import NotifyJPushDefinition from './models/jpush';
import NotifyUPushDefinition, { NotifyUPush } from './models/upush';
const config = require('config').get('notify');
import _ from 'lodash';
// const JPush = require('jpush-async').JPushAsync;
import * as event from './event';
import { PlayerUser } from 'packages/Player/lib/models/user';

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
  storage.registerModel(NotifyHistoryDefinition);
  storage.registerModel(NotifyJPushDefinition);
  storage.registerModel(NotifyUPushDefinition);

  app.on('initCompleted', function(app) {
    // 数据信息统计
    debug('storage has been load 2 notify db model');
  });
}

function initFunction() {
  const app = this;
  const db = app.storage.db;

  // const appkey = _.get(config, 'jpush.appKey');
  // const masterSecret = _.get(config, 'jpush.masterSecret');

  // if (!appkey || !masterSecret) {
  //   app.error('init function failed: need jpush info');
  //   return;
  // }

  // let _client;
  // try {
  //   _client = JPush.buildClient(config.jpush);
  // } catch (e) {
  //   app.errorWithContext('JPush 初始化失败', e);
  //   throw e;
  // }

  app.notify = {
    // JPush,
    // _client,
    // // JPush
    // async addNotifyHistory(options) {
    //   const ret = await db.models.notify_history.create({
    //     type: 'jpush',
    //     ...options,
    //   });
    //   return ret;
    // },
    // // JPush
    // async sendNotifyMsg(userUUID, title, msg, options = {}) {
    //   // TODO: 需要做频率限制与在线监测
    //   const platform = _.get(options, 'platform', JPush.ALL);
    //   const audience = _.get(options, 'audience', JPush.alias(userUUID));
    //   // 增加到history
    //   app.notify.addNotifyHistory({
    //     platform: 'all',
    //     user_uuid: userUUID,
    //     title,
    //     message: msg,
    //   });
    //   return await _client
    //     .push()
    //     .setPlatform(platform)
    //     .setAudience(audience)
    //     .setNotification(title, JPush.ios(title), JPush.android(title, null, 1))
    //     .setMessage(msg)
    //     .setOptions(null, 60)
    //     .send();
    // },
    // // JPush
    // async sendNotifyMsgByRegistrationId(
    //   registrationId,
    //   title,
    //   msg,
    //   options = {}
    // ) {
    //   // TODO: 需要做频率限制与在线监测
    //   const platform = _.get(options, 'platform', JPush.ALL);
    //   const audience = _.get(
    //     options,
    //     'audience',
    //     JPush.registration_id(registrationId)
    //   );
    //   // 增加到history
    //   app.notify.addNotifyHistory({
    //     platform: 'all',
    //     registration_id: registrationId,
    //     title,
    //     message: msg,
    //   });
    //   return await _client
    //     .push()
    //     .setPlatform(platform)
    //     .setAudience(audience)
    //     .setNotification(title, JPush.ios(title), JPush.android(title, null, 1))
    //     .setMessage(msg)
    //     .setOptions(null, 60)
    //     .send();
    // },
    // async getNotifyInfo(userUUID) {
    //   return await db.models.notify_jpush.findOne({
    //     where: {
    //       user_uuid: userUUID,
    //     },
    //   });
    // },
  };

  if (_.get(app, 'chat.tryNotify')) {
    const originTryNotify = app.chat.tryNotify;
    app.chat.tryNotify = async (pkg) => {
      originTryNotify(pkg);
      const { message, sender_uuid, to_uuid } = pkg;
      if (app.player.isSystemUUID(to_uuid)) {
        // 不尝试向系统发送推送
        debug('send chat notify cancel. target is system uuid[%s]', to_uuid);
        return;
      }

      // 发送友盟推送
      const senderInfo = await PlayerUser.findByUUID(sender_uuid);
      const upush = await NotifyUPush.findByUserUUID(to_uuid);
      if (!(upush && upush.is_active)) {
        debug(
          'send chat notify cancel! Not found active notifyInfo in uuid %s',
          to_uuid
        );
        return;
      }

      // 发送通知
      const title = senderInfo.getName();
      const extraBody = {};
      if (_.isString(senderInfo.getAvatarUrl())) {
        // 如果有头像， 则推送时带上头像
        _.set(extraBody, 'img', senderInfo.getAvatarUrl());
      }
      await upush.sendNotifyMsg(app, message, title, extraBody);
      debug(
        'send chat notify finished! to uuid %s[%s]: {%s: %s}',
        to_uuid,
        upush.registration_id,
        title,
        message
      );

      // // TODO: 这里要做一步缓存
      // const notifyInfo = await app.notify.getNotifyInfo(to_uuid);
      // if (notifyInfo && notifyInfo.is_active) {
      //   // 发送通知
      //   const registrationId = notifyInfo.registration_id;
      //   const senderInfo = await app.player.getUserInfo(sender_uuid);
      //   await app.notify.sendNotifyMsgByRegistrationId(
      //     registrationId,
      //     `${senderInfo.nickname || senderInfo.username}:`,
      //     message
      //   );
      //   debug(
      //     'send chat notify finished! to uuid %s[%s]',
      //     to_uuid,
      //     registrationId
      //   );
      // } else {
      //   debug(
      //     'send chat notify cancel! Not found notifyInfo in uuid %s',
      //     to_uuid
      //   );
      // }
    };
  }
}

function initSocket() {
  let app = this;
  app.registerEvent('notify::bindNotifyInfo', event.bindJPushNotifyInfo);
  app.registerEvent('notify::bindUPushNotifyInfo', event.bindUPushNotifyInfo);
}
