import Debug from 'debug';
const debug = Debug('trpg:component:player');
const uuid = require('uuid/v1');
const Router = require('koa-router');
const Geetest = require('gt3-sdk');
const md5 = require('./md5');
const event = require('./lib/event');
const PlayerList = require('./lib/list');

let geetest = null; // 极验的实例

module.exports = function PlayerComponent(app) {
  initConfig.call(app);
  initStorage.call(app);
  initFunction.call(app);
  initSocket.call(app);
  initRouters.call(app);
  initTimer.call(app);
  initReset.call(app);

  return {
    name: 'PlayerComponent',
  };
};

function initConfig() {
  const app = this;
  const registerConfig = app.get('registerConfig');
  if (registerConfig && registerConfig.geetest === true) {
    const geetestInfo = registerConfig.geetestInfo;
    geetest = new Geetest({
      geetest_id: geetestInfo.id,
      geetest_key: geetestInfo.key,
    });
  }
}

function initStorage() {
  let app = this;
  let storage = app.storage;
  storage.registerModel(require('./lib/models/user'));
  storage.registerModel(require('./lib/models/invite'));
  storage.registerModel(require('./lib/models/loginLog'));
  storage.registerModel(require('./lib/models/settings'));

  app.on('initCompleted', function(app) {
    // 数据信息统计
    debug('storage has been load 4 player db model');
  });
}
function initFunction() {
  let app = this;
  let storage = app.storage;
  let db = app.storage.db;

  app.player = {
    list: new PlayerList(),
    getPlayer: async function getPlayer(id, cb) {
      if (typeof id != 'number') {
        throw new Error(`id must be a Number, not a ${typeof id}`);
      }

      try {
        const user = await db.models.player_user.findByPk(id);
        cb(null, user);
      } catch (err) {
        cb(err, null);
      }
    },
    getUserInfo: async function getUserInfo(userUUID) {
      // TODO: 需要优化(从redis中获取缓存)
      return await db.models.player_user.findOne({
        where: { uuid: userUUID },
      });
    },
    makeFriendAsync: async function(uuid1, uuid2, db) {
      if (!uuid1 || !uuid2) {
        debug('make friend need 2 uuid: receive %o', { uuid1, uuid2 });
        return;
      }

      try {
        let user1 = await db.models.player_user.oneAsync({ uuid: uuid1 });
        let user2 = await db.models.player_user.oneAsync({ uuid: uuid2 });
        await user1.addFriend(user2);
        await user2.addFriend(user1);
      } catch (err) {
        throw err;
      }
    },
    getFriendsAsync: async function(uuid, db) {
      let user = await db.models.player_user.findOne({
        where: { uuid },
      });

      let friends = await user.getFriend();
      return friends;
    },
    joinSocketRoom: function(userUUID, roomUUID) {
      try {
        let player = app.player.list.get(userUUID);
        if (player) {
          player.socket.join(roomUUID);
        } else {
          console.error('加入房间失败:', `玩家${roomUUID}不在线`);
        }
      } catch (e) {
        console.error('加入房间失败:', e);
      }
    },
    leaveSocketRoom: function(userUUID, roomUUID) {
      try {
        let player = app.player.list.get(userUUID);
        if (player) {
          player.socket.leave(roomUUID);
        } else {
          console.error('离开房间失败:', `玩家${roomUUID}不在线`);
        }
      } catch (e) {
        console.error('离开房间失败:', e);
      }
    },
    // 服务端直接创建用户
    createNewAsync: async function(username, password, options) {
      let data = Object.assign(
        {},
        {
          username,
          password: md5(md5(password)), // 客户端一层md5, 服务端一层md5, 所以服务端直接创建用户需要2层md5加密
        },
        options
      );
      let player = await db.models.player_user.create(data);
      return player;
    },
  };
}
function initSocket() {
  let app = this;
  app.registerEvent('player::login', event.login);
  app.registerEvent('player::loginWithToken', event.loginWithToken);
  app.registerEvent('player::register', event.register);
  app.registerEvent('player::getInfo', event.getInfo);
  app.registerEvent('player::updateInfo', event.updateInfo);
  app.registerEvent('player::changePassword', event.changePassword);
  app.registerEvent('player::logout', event.logout);
  app.registerEvent('player::findUser', event.findUser);
  app.registerEvent('player::addFriend', event.addFriend);
  app.registerEvent('player::getFriends', event.getFriends);
  app.registerEvent('player::sendFriendInvite', event.sendFriendInvite);
  app.registerEvent('player::refuseFriendInvite', event.refuseFriendInvite);
  app.registerEvent('player::agreeFriendInvite', event.agreeFriendInvite);
  app.registerEvent('player::getFriendsInvite', event.getFriendsInvite);
  app.registerEvent('player::checkUserOnline', event.checkUserOnline);
  app.registerEvent('player::getSettings', event.getSettings);
  app.registerEvent('player::saveSettings', event.saveSettings);

  // TODO:需要考虑到断线重连的问题
  app.on('disconnect', function(socket) {
    let player = app.player.list.find(socket);
    if (player) {
      debug('user[%s] disconnect, remove it from list', player.uuid);
      app.player.list.remove(player.uuid);
    }
  });
}

function initRouters() {
  const app = this;
  const webservice = app.webservice;
  const router = new Router();

  const register = require('./lib/routers/register');
  router.use((ctx, next) => {
    ctx.geetest = geetest; // 中间件声明全局实例
    return next();
  });
  router.use('/player/register', register.routes());
  webservice.use(router.routes());
}

function initTimer() {
  let app = this;

  app.registerStatJob('playerCount', async () => {
    let db = app.storage.db;
    let res = await db.models.player_user.count();
    return res;
  });

  app.registerStatJob('playerLoginIPParse', async () => {
    let db = app.storage.db;
    try {
      let logs = await db.models.player_login_log.findAll({
        where: {
          ip_address: null,
        },
      });
      for (let log of logs) {
        let ip = log.ip;
        if (ip.indexOf(':') >= 0) {
          let tmp = ip.split(':');
          ip = tmp[tmp.length - 1];
        }
        debug('请求ip信息地址:', ip);
        let info = await app.request.post(
          'http://ip.taobao.com/service/getIpInfo2.php',
          'ip=' + ip,
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          }
        );
        if (info.code === 0) {
          let data = info.data;
          log.ip_address = `[${data.isp}]${data.country} ${data.region} ${
            data.city
          } ${data.county}`;
          debug('请求ip信息结果:', log.ip_address);
          await log.saveAsync();
        }
      }
      return new Date().valueOf();
    } catch (error) {
      debug('parse player login log ip error:', error);
      app.error(error);
    }
  });
}

function initReset() {
  let app = this;

  app.register('resetStorage', async function(storage, db) {
    debug('start reset player storage');
    try {
      let players = [];
      for (let i = 1; i <= 10; i++) {
        players.push({
          username: 'admin' + i,
          password: md5(md5('admin')),
        });
      }
      let res = await db.models.player_user.bulkCreate([
        {
          username: 'admin',
          password: md5(md5('admin')),
          avatar: 'http://www.qqzhi.com/uploadpic/2015-01-22/022222987.jpg',
          nickname: '管理员',
          sign: '伟大的管理员大大',
        },
        ...players,
      ]);

      // 测试：相互添加好友
      await res[0].addFriend(res[1]);
      await res[1].addFriend(res[0]);
      debug('player storage reset completed!');
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
}
