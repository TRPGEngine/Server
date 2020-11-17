import Debug from 'debug';
const debug = Debug('trpg:component:chat');
import * as event from './event';
import LogDefinition, { ChatLog } from './models/log';
import ChatConverseDefinition from './models/converse';
import { ChatMessagePartial } from '../types/message';
import BasePackage from 'lib/package';
import { initInterceptors } from './interceptors';
import ChatConverseAckDefinition from './models/converse-ack';
import { EVENT_PLAYER_REGISTER } from 'packages/Player/lib/const';
import _ from 'lodash';

// 注入方法声明
declare module 'packages/Core/lib/application' {
  interface Application {
    chat: {
      tryNotify(pkg: ChatMessagePartial): void;
      [others: string]: any;
    };
  }
}

export default class Chat extends BasePackage {
  public name: string = 'Chat';
  public require: string[] = ['Player'];
  public desc: string = '聊天通讯模块';

  onInit(): void {
    this.regModel(LogDefinition);
    this.regModel(ChatConverseDefinition);
    this.regModel(ChatConverseAckDefinition);

    this.initMethods();

    this.regSocketEvent('message', event.message);
    this.regSocketEvent('revokeMsg', event.revokeMsg);
    this.regSocketEvent('getConverses', event.getConverses);
    this.regSocketEvent('removeConverse', event.removeConverse);
    this.regSocketEvent('getUserChatLog', event.getUserChatLog);
    this.regSocketEvent('getConverseChatLog', event.getConverseChatLog);
    this.regSocketEvent('getAllUserConverse', event.getAllUserConverse);
    this.regSocketEvent('getOfflineUserConverse', event.getOfflineUserConverse);
    this.regSocketEvent('updateCardChatData', event.updateCardChatData);

    this.initTimer();
    this.initData();
    this.initListener();

    initInterceptors();
  }

  initMethods() {
    const app = this.app;
    const db = this.db;

    this.regPackageData('converses', {}); // 会话信息缓存.用于检测会话是否创建

    this.regMethods({
      addConverse: function (userUUID: string, converseUUID: string) {
        let prev = app.chat.converses[userUUID] || [];
        prev.push(converseUUID);
        let next = Array.from(new Set(prev));
        app.chat.converses[userUUID] = next;
      },
      findMsgAsync: async function (msg_uuid: string) {
        const logList = await ChatLog.getCachedChatLog();
        for (var i = 0; i < logList.length; i++) {
          let log = logList[i];
          if (log.uuid === msg_uuid) {
            return log;
          }
        }

        let res = await db.models.chat_log.findOne({
          where: { uuid: msg_uuid },
        });
        return res;
      },
      /**
       * @deprecated
       */
      updateMsgAsync: async function (msg_uuid, payload) {
        // payload需要为完整的聊天记录对象
        let notify = () => {
          let isGroup = payload.is_group;
          if (isGroup === true) {
            app.chat.notifyUpdateMsg(payload.converse_uuid, true, payload);
          } else if (isGroup === false) {
            app.chat.notifyUpdateMsg(
              [payload.sender_uuid, payload.to_uuid],
              false,
              payload
            );
          }
        };

        const logList = await ChatLog.getCachedChatLog();
        for (var i = 0; i < logList.length; i++) {
          let log = logList[i];
          if (log.uuid === msg_uuid) {
            // 如果在内存数据库中找到则直接通知并返回
            ChatLog.updateCachedChatLog(i, payload);
            notify();
            return payload;
          }
        }

        let res = await db.models.chat_log.findOne({
          where: { uuid: msg_uuid },
        });
        Object.assign(res, payload);
        res = await res.save();
        notify();

        return res;
      },
      /**
       * @deprecated 使用ChatLog.sendMsg
       */
      sendMsg: function (from_uuid: string, to_uuid: string, info: any) {
        // 不检测发送者uuid, 用于系统发送消息
        const {
          converse_uuid,
          message = '',
          type = 'normal',
          is_public = false,
          is_group = false,
          data = null,
        } = info;

        const pkg: ChatMessagePartial = {
          message,
          sender_uuid: from_uuid,
          to_uuid: to_uuid,
          converse_uuid,
          type,
          is_public,
          is_group,
          data,
        };
        debug('发送消息: [to %s] %o', to_uuid, pkg);

        const log = event.addChatLog.call(app, pkg);
        if (!pkg.is_public) {
          // 是私密消息
          app.player.manager.unicastSocketEvent(to_uuid, 'chat::message', log);
        } else {
          // 是公开消息
          if (!pkg.is_group) {
            // TODO: 这里好像有问题
            // 疑问: 什么情况下会出现公开的用户信息？
            app.io.sockets.emit('chat::message', log);
          } else {
            // TODO: 需要校验
            app.player.manager.roomcastSocketEvent(
              converse_uuid,
              'chat::message',
              log
            );
          }
        }

        return log;
      },
      /**
       * @deprecated 使用ChatLog.sendSystemMsg
       */
      sendSystemMsg: function (
        to_uuid: string,
        type: string, // 卡片信息的类型 , 如果为空字符串则为普通信息
        title: string,
        content: string,
        mergeData?: any
      ) {
        let pkg = {
          message: content,
          type: 'card',
          is_public: false,
          is_group: false,
          data: Object.assign(
            {},
            {
              type: type,
              title: title,
              content: content,
            },
            mergeData
          ),
        };
        if (type == '') {
          // 如果type为空，则发送普通信息
          pkg.type = 'normal';
          pkg.data = null;
        }
        debug('发送系统消息:');
        app.chat.sendMsg('trpgsystem', to_uuid, pkg);
      },
      /**
       * @deprecated 使用ChatLog.sendSimpleSystemMsg
       */
      sendSystemSimpleMsg: function (to_uuid, msg) {
        app.chat.sendSystemMsg(to_uuid, '', '', msg, null);
      },
      saveChatLogAsync: async function () {
        try {
          await ChatLog.dumpCachedChatLog();
          debug('save chat log success!');
        } catch (err) {
          console.error('save chat log error', err);
          throw err;
        }
      },
      getChatLogSumAsync: async function () {
        let res = await db.models.chat_log.count();
        return res;
      },
      getChatLogAsync: async function (page = 1, limit = 10) {
        let res = await db.models.chat_log.findAll({
          limit: limit,
          offset: (page - 1) * limit,
        });
        return res;
      },
      // 如果为团信息, converseUUID是团uuid, 否则将是一个数组[uuid1, uuid2]来进行相互通知
      notifyUpdateMsg: function (converseUUID, isGroup, payload) {
        debug('通知更新聊天内容:', converseUUID, isGroup, payload);
        if (isGroup) {
          // 团聊更新
          app.io.sockets.to(converseUUID).emit('chat::updateMessage', {
            converseUUID,
            payload,
          });
        } else if (converseUUID instanceof Array) {
          let [uuid1, uuid2] = converseUUID;

          app.player.manager.unicastSocketEvent(uuid1, 'chat::updateMessage', {
            converseUUID: uuid2,
            payload,
          });
          app.player.manager.unicastSocketEvent(uuid2, 'chat::updateMessage', {
            converseUUID: uuid1,
            payload,
          });
        }
      },
      tryNotify(messagePkg) {
        // 尝试通知， 用于被其他组件重写
      },
    });
  }

  initTimer() {
    const app = this.app;

    this.regScheduleJob('saveChatLog', '0 0,10,20,30,40,50 * * * *', () =>
      app.chat.saveChatLogAsync()
    );

    this.regStatJob('chatLogCount', async () => {
      await app.chat.saveChatLogAsync();
      return await app.chat.getChatLogSumAsync();
    });
  }

  initListener() {
    const welcomeMsg = this.app.get('welcomeMsg'); // 这是一个低频更新操作，所以一次重启获取一次即可
    this.app.on(EVENT_PLAYER_REGISTER, (playerUUID: string) => {
      if (_.isNil(playerUUID)) {
        return;
      }
      ChatLog.sendSimpleSystemMsg(playerUUID, null, welcomeMsg);
    });
  }

  /**
   * @deprecated
   * 初始化获取所有的会话列表
   */
  async initData() {
    const app = this.app;
    const db = app.storage.db;

    try {
      const converses = await db.models.chat_converse.findAll();
      for (let conv of converses) {
        debug('loaded converse %s', conv.uuid);
        app.chat.converses[conv.uuid] = Object.assign({}, conv);
      }
    } catch (err) {
      // 可能是表不存在
      console.error('[chat]加载会话列表失败');
    }
  }
}
