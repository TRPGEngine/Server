import Debug from 'debug';
const debug = Debug('trpg:component:player');
import BasePackage from 'lib/package';
import Router from 'koa-router';
const Geetest = require('gt3-sdk');
import md5 from './utils/md5';
import sha1 from './utils/sha1';
const event = require('./event');
import PlayerList from './list';
import PlayerUserDefinition, { PlayerUser } from './models/user';
import PlayerInviteDefinition from './models/invite';
import PlayerLoginLogDefinition, { PlayerLoginLog } from './models/login-log';
import PlayerSettingsDefinition from './models/settings';

export default class Player extends BasePackage {
  public name: string = 'Player';
  public require: string[] = [];
  public desc: string = '用户模块';
  private geetest = null; // 极验的实例

  onInit(): void {
    this.initConfig();
    this.initStorage();
    this.initFunction();
    this.initSocket();
    this.initRouters();
    this.initTimer();
  }

  private initConfig() {
    const app = this.app;
    const registerConfig = app.get('registerConfig');
    if (registerConfig && registerConfig.geetest === true) {
      const geetestInfo = registerConfig.geetestInfo;
      this.geetest = new Geetest({
        geetest_id: geetestInfo.id,
        geetest_key: geetestInfo.key,
      });
    }
  }

  private initStorage() {
    this.regModel(PlayerUserDefinition);
    this.regModel(PlayerInviteDefinition);
    this.regModel(PlayerLoginLogDefinition);
    this.regModel(PlayerSettingsDefinition);
  }

  private initFunction() {
    const app = this.app;

    app.player = {
      list: new PlayerList(),
      getPlayer: async function getPlayer(id, cb) {
        if (typeof id != 'number') {
          throw new Error(`id must be a Number, not a ${typeof id}`);
        }

        try {
          const user = await PlayerUser.findByPk(id);
          cb(null, user);
        } catch (err) {
          cb(err, null);
        }
      },
      getUserInfo: async function getUserInfo(userUUID) {
        // TODO: 需要优化(从redis中获取缓存)
        return await PlayerUser.findOne({
          where: { uuid: userUUID },
        });
      },
      makeFriendAsync: async function(uuid1, uuid2, db) {
        if (!uuid1 || !uuid2) {
          debug('make friend need 2 uuid: receive %o', { uuid1, uuid2 });
          return;
        }

        try {
          let user1 = await PlayerUser.findOne({
            where: { uuid: uuid1 },
          });
          let user2 = await PlayerUser.findOne({
            where: { uuid: uuid2 },
          });
          await user1.addFriend(user2);
          await user2.addFriend(user1);
        } catch (err) {
          throw err;
        }
      },
      getFriendsAsync: async function(uuid, db) {
        let user = await PlayerUser.findOne({
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
        const modelUser = PlayerUser;
        const salt = modelUser.genSalt();
        let data = Object.assign(
          {},
          {
            username,
            password: sha1(md5(md5(password)) + salt),
            salt,
          },
          options
        );
        let player = await PlayerUser.create(data);
        return player;
      },
      // 记录用户离线时间
      recordUserOfflineDate: async function(socket) {
        const player = app.player.list.find(socket);
        if (player) {
          // 如果该用户已登录
          const lastLog = await PlayerLoginLog.findOne({
            where: {
              user_uuid: player.uuid,
              socket_id: socket.id,
            },
            order: [['id', 'desc']],
          });
          if (lastLog) {
            // 如果有记录则更新，没有记录则无视
            lastLog.offline_date = new Date();
            await lastLog.save();
          }
        }
      },
      /**
       * 监测该UUID是否为用户的UUID
       * @param uuid 监测的UUID
       */
      isSystemUUID: function isSystemUUID(uuid: string) {
        return uuid.indexOf('trpg') >= 0;
      },
    };

    // 断开连接时记录登出时间
    app.on('disconnect', (socket) => {
      app.player.recordUserOfflineDate(socket);
    });
  }

  private initSocket() {
    this.regSocketEvent('player::login', event.login);
    this.regSocketEvent('player::loginWithToken', event.loginWithToken);
    this.regSocketEvent('player::register', event.register);
    this.regSocketEvent('player::getInfo', event.getInfo);
    this.regSocketEvent('player::updateInfo', event.updateInfo);
    this.regSocketEvent('player::changePassword', event.changePassword);
    this.regSocketEvent('player::logout', event.logout);
    this.regSocketEvent('player::findUser', event.findUser);
    // this.regSocketEvent('player::addFriend', event.addFriend); // 禁止直接加好友接口
    this.regSocketEvent('player::getFriends', event.getFriends);
    this.regSocketEvent('player::sendFriendInvite', event.sendFriendInvite);
    this.regSocketEvent('player::refuseFriendInvite', event.refuseFriendInvite);
    this.regSocketEvent('player::agreeFriendInvite', event.agreeFriendInvite);
    this.regSocketEvent('player::getFriendsInvite', event.getFriendsInvite);
    this.regSocketEvent('player::checkUserOnline', event.checkUserOnline);
    this.regSocketEvent('player::getSettings', event.getSettings);
    this.regSocketEvent('player::saveSettings', event.saveSettings);

    // TODO:需要考虑到断线重连的问题
    const app = this.app;
    app.on('disconnect', function(socket) {
      let player = app.player.list.find(socket);
      if (player) {
        debug('user[%s] disconnect, remove it from list', player.uuid);
        app.player.list.remove(player.uuid);
      }
    });
  }

  private initRouters() {
    const app = this.app;
    const webservice = app.webservice;
    const router = new Router();

    const register = require('./routers/register');
    router.use((ctx, next) => {
      ctx.geetest = this.geetest; // 中间件声明全局实例
      return next();
    });
    router.use('/player/register', register.routes());
    webservice.use(router.routes());
  }

  private initTimer() {
    const app = this.app;

    app.registerStatJob('playerCount', async () => {
      let res = await PlayerUser.count();
      return res;
    });

    app.registerStatJob('playerLoginIPParse', async () => {
      try {
        const logs = await PlayerLoginLog.findAll({
          where: {
            ip_address: null,
          },
        });
        const cacheMap = {}; // 缓存, Key 为IP. 值为地址 仅缓存当次任务的信息记录
        for (const log of logs) {
          let ip = log.ip;
          if (ip.indexOf(':') >= 0) {
            const tmp = ip.split(':');
            ip = tmp[tmp.length - 1];
          }

          if (cacheMap[ip]) {
            // 如果缓存中已经有记录, 则从缓存中更新地址
            const ip_address = cacheMap[ip];
            debug('从缓存中更新ip地址:', ip, ip_address);
            log.ip_address = ip_address;
            await log.save();
            continue;
          }

          debug('请求ip信息地址:', ip);
          const info = await app.request.post(
            'http://ip.taobao.com/service/getIpInfo2.php',
            'ip=' + ip,
            {
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }
          );
          if (info.code === 0) {
            // 请求成功
            const data = info.data;
            const ip_address = `[${data.isp}]${data.country} ${data.region} ${
              data.city
            } ${data.county}`;
            log.ip_address = ip_address;
            debug('请求ip信息结果:', ip_address);
            cacheMap[ip] = ip_address;
            await log.save();
          }
        }
        return new Date().valueOf();
      } catch (error) {
        debug('parse player login log ip error:', error);
        app.error(error);
      }
    });
  }
}

// function initReset() {
//   let app = this;

//   app.register('resetStorage', async function(storage, db) {
//     debug('start reset player storage');
//     try {
//       let players = [];
//       for (let i = 1; i <= 10; i++) {
//         players.push({
//           username: 'admin' + i,
//           password: md5(md5('admin')),
//         });
//       }
//       let res = await db.models.player_user.bulkCreate([
//         {
//           username: 'admin',
//           password: md5(md5('admin')),
//           avatar: 'http://www.qqzhi.com/uploadpic/2015-01-22/022222987.jpg',
//           nickname: '管理员',
//           sign: '伟大的管理员大大',
//         },
//         ...players,
//       ]);

//       // 测试：相互添加好友
//       await res[0].addFriend(res[1]);
//       await res[1].addFriend(res[0]);
//       debug('player storage reset completed!');
//     } catch (err) {
//       console.error(err);
//       throw err;
//     }
//   });
// }
