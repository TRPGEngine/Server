const debug = require('debug')('trpg:component:chat');
const event = require('./event');

module.exports = function ChatComponent(app) {
  initStorage.call(app);
  initFunction.call(app);
  initSocket.call(app);
  initTimer.call(app);
  initData.call(app);
  initReset.call(app);

  return {
    name: 'ChatComponent',
    require: ['PlayerComponent'],
  }
}

function initStorage() {
  let app = this;
  let storage = app.storage;
  storage.registerModel(require('./models/log.js'));
  storage.registerModel(require('./models/converse.js'));

  app.on('initCompleted', function(app) {
    // 数据信息统计
    debug('storage has been load 2 chat db model');
  });
}

function initFunction() {
  const app = this;
  const db = app.storage.db;

  app.chat = {
    log: [],// 聊天记录缓存，每10分钟会把记录存储到数据库中
    converses: {},// 会话信息缓存.用于检测会话是否创建
    addConverse: function(userUUID, converseUUID) {
      let prev = app.chat.converses[userUUID] || [];
      prev.push(converseUUID);
      let next = Array.from(new Set(prev));
      app.chat.converses[userUUID] = next;
    },
    findMsgAsync: async function(msg_uuid) {
      for (var i = 0; i < app.chat.log.length; i++) {
        let log = app.chat.log[i];
        if(log.uuid === msg_uuid) {
          return log;
        }
      }

      let res = await db.models.chat_log.oneAsync({uuid: msg_uuid});
      return res;
    },
    updateMsgAsync: async function(msg_uuid, payload) {
      // payload需要为完整的聊天记录对象
      let notify = () => {
        let isGroup = payload.is_group;
        if(isGroup === true) {
          app.chat.notifyUpdateMsg(payload.converse_uuid, true, payload);
        }else if(isGroup === false) {
          app.chat.notifyUpdateMsg([payload.sender_uuid, payload.to_uuid], false, payload);
        }
      }

      for (var i = 0; i < app.chat.log.length; i++) {
        let log = app.chat.log[i];
        if(log.uuid === msg_uuid) {
          // 如果在内存数据库中找到则直接通知并返回
          app.chat.log[i] = payload;
          notify();
          return payload;
        }
      }

      let res = await db.models.chat_log.oneAsync({uuid: msg_uuid});
      Object.assign(res, payload);
      res = await res.saveAsync();
      notify();

      return res;
    },
    sendMsg: function(from_uuid, to_uuid, info) {
      // 不检测发送者uuid, 用于系统发送消息
      let converse_uuid = info.converse_uuid;
      let pkg = {
        message: info.message || '',
        sender_uuid: from_uuid,
        to_uuid: to_uuid,
        converse_uuid,
        type: info.type || 'normal',
        is_public: info.is_public || false,
        is_group: info.is_group || false,
        data: info.data || null
      };
      debug('发送消息: [to %s] %o', to_uuid, pkg)

      let log = event.addChatLog.call(app, pkg);
      if(!pkg.is_public) {
        let other = app.player.list.get(to_uuid);
        if(!!other) {
          other.socket.emit('chat::message', log);
        }else {
          debug('[用户:%s]: 接收方%s不在线', from_uuid, to_uuid);
        }
      }else {
        // 群聊
        if(!pkg.is_group) {
          app.io.sockets.emit('chat::message', log);
        }else {
          let sender = app.player.list.get(from_uuid);
          if(sender) {
            sender.socket.broadcast.to(converse_uuid).emit('chat::message', log);
          }else {
            app.io.sockets.in(converse_uuid).emit('chat::message', log);
          }
        }
      }

      return log;
    },
    sendSystemMsg: function(to_uuid, type, title, content, mergeData) {
      let pkg = {
        message: content,
        type: 'card',
        is_public: false,
        is_group: false,
        data: Object.assign({}, {
          type: type,
          title: title,
          content: content
        }, mergeData),
      };
      if(type == '') {
        // 如果type为空，则发送普通信息
        pkg.type = 'normal';
        pkg.data = null;
      }
      debug('发送系统消息:');
      app.chat.sendMsg('trpgsystem', to_uuid, pkg);
    },
    sendSystemSimpleMsg: function(to_uuid, msg) {
      app.chat.sendSystemMsg(to_uuid, '', '', msg, null);
    },
    saveChatLogAsync: async function() {
      let logList = app.chat.log;
      let cacheList = Object.assign([], logList);
      logList.splice(0, cacheList.length); // 清除cache里的数据
      try {
        let res = await db.models.chat_log.bulkCreate(cacheList);
        debug("save chat log success!");
        return res;
      }catch(err) {
        console.error('save chat log error', err);
      }

      return false;
    },
    getChatLogSumAsync: async function() {
      let res = await db.models.chat_log.count();
      return res;
    },
    getChatLogAsync: async function(page = 1, limit = 10) {
      let res = await db.models.chat_log.findAll({
        limit: limit,
        offset: (page - 1) * limit,
      });
      return res;
    },
    // 如果为团信息, converseUUID是团uuid, 否则将是一个数组[uuid1, uuid2]来进行相互通知
    notifyUpdateMsg: function(converseUUID, isGroup, payload) {
      debug('通知更新聊天内容:', converseUUID, isGroup, payload);
      if(isGroup) {
        // 团聊更新
        app.io.to(converseUUID).emit('chat::updateMessage', {
          converseUUID,
          payload,
        })
      }else if(converseUUID instanceof Array) {
        let [uuid1, uuid2] = converseUUID
        let player1 = app.player.list.get(uuid1);
        let player2 = app.player.list.get(uuid2);
        if(player1) {
          player1.socket.emit('chat::updateMessage', {
            converseUUID: uuid2,
            payload,
          });
        }
        if(player2) {
          player2.socket.emit('chat::updateMessage', {
            converseUUID: uuid1,
            payload,
          });
        }
      }
    },
  };
}

function initSocket() {
  let app = this;
  app.registerEvent('chat::message', event.message);
  app.registerEvent('chat::getConverses', event.getConverses);
  // app.registerEvent('chat::createConverse', event.createConverse); // 弃用
  app.registerEvent('chat::removeConverse', event.removeConverse);
  // app.registerEvent('chat::getChatLog', event.getChatLog);
  app.registerEvent('chat::getUserChatLog', event.getUserChatLog);
  app.registerEvent('chat::getConverseChatLog', event.getConverseChatLog);
  app.registerEvent('chat::getAllUserConverse', event.getAllUserConverse);
  app.registerEvent('chat::getOfflineUserConverse', event.getOfflineUserConverse);
  app.registerEvent('chat::updateCardChatData', event.updateCardChatData);
  app.registerEvent('chat::startWriting', event.startWriting);
  app.registerEvent('chat::stopWriting', event.stopWriting);
}

function initTimer() {
  let app = this;
  let timer = setInterval(function saveChat() {
    // event.saveChatLog.call(app);
    app.chat.saveChatLogAsync();
  }, 1000*60*10);

  app.registerStatJob('chatLogCount', async () => {
    await app.chat.saveChatLogAsync();
    return await app.chat.getChatLogSumAsync();
  })

  app.on('close', function() {
    clearInterval(timer);
  });
}

async function initData() {
  let app = this;
  let db = app.storage.db;

  try {
    const converses = await db.models.chat_converse.findAll();
    for (let conv of converses) {
      debug('loaded converse %s', conv.uuid);
      app.chat.converses[conv.uuid] = Object.assign({}, conv);
    }
  }catch (err) {
    // 可能是表不存在
    console.error('[chat]加载会话列表失败');
  }
}

function initReset() {
  let app = this;
  app.register('resetStorage', async function(storage, db) {
    debug('start reset chat storage');
    if(!app.player) {
      throw new Error('[ChatComponent] require component [PlayerComponent]');
    }else {
      let users = await db.models.player_user.findAll({
        where: {
          id:[1,2]
        }
      });
      let uuid1 = users[0].uuid;
      let uuid2 = users[1].uuid;
      // let converse = await db.models.chat_converse.createAsync({name: '临时多人会话'});
      // await converse.addParticipantsAsync(users);
      // let converse_uuid = converse.uuid;
      let converse_uuid = null;
      const addChatLog = event.addChatLog.bind(app);
      addChatLog({
        sender_uuid: uuid1,
        to_uuid:uuid2,
        converse_uuid,
        message:'你好啊',
        type:'normal',
        is_public:true,
        is_group: false,
      });
      addChatLog({
        sender_uuid: uuid1,
        to_uuid:uuid2,
        converse_uuid,
        message:'在么',
        type:'normal',
        is_public:true,
        is_group: false,
      });
      addChatLog({
        sender_uuid: uuid2,
        to_uuid:uuid1,
        converse_uuid,
        message:'你也好啊',
        type:'normal',
        is_public:true,
        is_group: false,
      });
      addChatLog({
        sender_uuid: uuid1,
        to_uuid:uuid2,
        converse_uuid,
        message:'我们来跑团吧？',
        type:'normal',
        is_public:true,
        is_group: false,
      });
      addChatLog({
        sender_uuid: uuid2,
        to_uuid:uuid1,
        converse_uuid,
        message:'好啊好啊',
        type:'normal',
        is_public:true,
        is_group: false,
      });

      // 系统消息
      let systemMsg = `${users[1].nickname || users[1].username} 想添加您为好友`;
      app.chat.sendSystemMsg(uuid1, 'friendInvite', '系统请求测试', systemMsg, {});
      app.chat.sendSystemMsg(uuid1, '', '系统普通测试', systemMsg, {});

      app.registerTimerOnce(function() {
        console.log('发送测试信息');
        app.chat.sendMsg('trpgsystem', uuid1, {
          converse_uuid,
          message: systemMsg,
          type: 'card',
          is_public: false,
          is_group: false,
          data: {
            title: '好友申请延时测试',
            type: 'friendInvite',
            content: systemMsg,
            uuid: uuid2,
          },
        })
      }, 20000);

      // 增加初始会话
      // await db.models.chat_converse.createAsync({
      //   uuid: uuid2,
      //   type: 'user',
      //   name: users[1].username,
      //   icon: '',
      //   owner_id: users[0].id
      // });
      await app.chat.saveChatLogAsync();// 存储聊天记录
    }
  });
}
