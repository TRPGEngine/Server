import md5Encrypt from '../utils/md5';
import sha1Encrypt from '../utils/sha1';
import randomString from 'crypto-random-string';
import {
  Model,
  DBInstance,
  Orm,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyAddAssociationMixin,
} from 'trpg/core';
import config from 'config';
import _ from 'lodash';
import { fn, col } from 'sequelize';
import {
  PlayerJWTPayload,
  PlayerInfoObject,
} from 'packages/Player/types/player';
import Debug from 'debug';
import { NoReportError } from 'lib/error';
import {
  createRateLimiterWithTRPGApplication,
  RateLimiter,
} from 'packages/Core/lib/utils/rate-limit';
const debug = Debug('trpg:component:player:model');

// 阵营九宫格
export type Alignment =
  | 'LG'
  | 'NG'
  | 'CG'
  | 'LN'
  | 'TN'
  | 'CN'
  | 'LE'
  | 'NE'
  | 'CE';

/**
 * 生成用户的缓存key
 * @param uuid 用户UUID
 */
export const getPlayerUserCacheKey = (uuid: string): string =>
  `player:user:info:${uuid}`;

declare module 'packages/Player/lib/models/user' {
  interface PlayerUser {
    getFriend?: BelongsToManyGetAssociationsMixin<PlayerUser>;
    addFriend?: BelongsToManyAddAssociationMixin<PlayerUser, number>;
  }
}

export class PlayerUser extends Model {
  // 保护字段
  static passwordField: string[] = ['password'];
  static protectedField: string[] = [
    ...PlayerUser.passwordField,
    'salt',
    'token',
    'app_token',
    'last_ip',
  ];

  id: number;
  uuid: string;
  username: string;
  password: string;
  salt: string;
  nickname: string;
  name: string;
  avatar: string;
  last_login: Date;
  last_ip: string;
  token: string;
  app_token: string;
  sex: '男' | '女' | '其他' | '保密';
  sign: string; // 个人签名
  alignment: Alignment;
  banned: boolean; // 是否被封禁
  role: string; // 用户角色
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;

  private static _registerRateLimiter: RateLimiter = null;
  /**
   * 单例模式
   * 获取注册的限流器
   *
   */
  static getRegisterRateLimiter(): RateLimiter {
    if (_.isNull(PlayerUser._registerRateLimiter)) {
      const trpgapp = PlayerUser.getApplication();
      PlayerUser._registerRateLimiter = createRateLimiterWithTRPGApplication(
        trpgapp,
        {
          keyPrefix: 'register',
          // 默认每3小时可以注册4次 每次注册成功扣10点 仅发送请求扣1点
          points: trpgapp.get('rateLimit.register.points') ?? 40,
          duration: trpgapp.get('rateLimit.register.duration') ?? 3 * 60 * 60,
        }
      );
    }

    return PlayerUser._registerRateLimiter;
  }

  /**
   * 生成一个长度为16的随机盐
   */
  static genSalt(): string {
    return md5Encrypt(randomString(16));
  }

  /**
   * 生成一个存储于数据库的密码hash
   * 最终加密结果为: sha1(md5(md5(*realpass*)) + salt)
   * @param realPassword 客户端传来的密码(已经过客户端)
   * @param salt 盐值
   */
  static genPassword(clientPassword: string, salt: string): string {
    return sha1Encrypt(md5Encrypt(clientPassword) + salt);
  }

  /**
   * 签发JWT
   * 会进行缓存。在系统中缓存半天 签证1天过期
   */
  static async signJWT(uuid: string): Promise<string> {
    const app = PlayerUser.getApplication();
    const cacheKey = `player:jwt:${uuid}`;
    const cacheExpires = 1000 * 60 * 60 * 12; // 缓存过期时间12小时

    // 如果缓存中已经有签证了，则直接返回缓存中的签证
    const cachedJWT = await app.cache.get(cacheKey);
    if (_.isString(cachedJWT) && cachedJWT !== '') {
      return cachedJWT;
    }

    const user = await PlayerUser.findByUUID(uuid);

    const jwt = app.jwtSign({
      uuid: user.uuid,
      name: user.getName(),
      avatar: user.getAvatarUrl(),
    } as PlayerJWTPayload);

    await app.cache.set(cacheKey, jwt, { expires: cacheExpires });

    return jwt;
  }

  /**
   * 校验JWT
   * 返回Token中的用户信息
   */
  static async verifyJWT(jwt: string): Promise<PlayerJWTPayload> {
    const app = PlayerUser.getApplication();
    const data = await app.jwtVerify(jwt);

    if (_.isString(data) || _.isNil(_.get(data, 'uuid'))) {
      throw new Error('该token不是一个用户JWT');
    }

    return data as PlayerJWTPayload;
  }

  /**
   * 根据用户UUID查找用户
   * @param userUUID 用户UUID
   */
  static async findByUUID(userUUID: string): Promise<PlayerUser> {
    const cacheKey = getPlayerUserCacheKey(userUUID);
    const app = PlayerUser.getApplication();
    const cacheVal = await app.cache.get(cacheKey);

    if (_.isObject(cacheVal) && !_.isEmpty(cacheVal)) {
      // 应用缓存
      return new PlayerUser(cacheVal, {
        isNewRecord: false,
      });
    } else {
      const user = await PlayerUser.findOne({
        where: {
          uuid: userUUID,
        },
      });
      if (!_.isNil(user)) {
        // 仅不为空的时候记录缓存
        await app.cache.set(cacheKey, user); // 设置缓存
      }
      return user;
    }
  }

  /**
   * 根据用户名和密码查找用户
   * @param username 用户名
   * @param password 密码
   */
  static findByUsernameAndPassword(
    username: string,
    password: string
  ): Promise<PlayerUser | null> {
    return PlayerUser.scope('login').findOne({
      where: {
        username,
        password: fn('SHA1', fn('CONCAT', fn('MD5', password), col('salt'))),
      },
    });
  }

  /**
   * 注册新用户
   * @param username 用户名
   * @param password md5后的密码
   */
  static async registerUser(
    username: string,
    password: string,
    ip: string = 'none'
  ): Promise<PlayerUser> {
    if (_.isNil(username)) {
      throw new NoReportError('用户名不能为空');
    }

    if (_.isNil(password)) {
      throw new NoReportError('密码不能为空');
    }

    if (username.length > 18) {
      throw new NoReportError('注册失败!用户名过长');
    }

    const rateLimiter = PlayerUser.getRegisterRateLimiter();

    try {
      await rateLimiter.consume(ip, 1);
    } catch (err) {
      throw new NoReportError('注册过于频繁, 请3小时后再试');
    }

    const user = await PlayerUser.findOne({
      where: { username },
      limit: 1,
    });
    if (!!user) {
      debug(`register failed!user ${user.username} has been existed`);
      throw new NoReportError('用户名已存在');
    }

    const salt = PlayerUser.genSalt();

    const player = PlayerUser.create({
      username,
      password: PlayerUser.genPassword(password, salt), // 存储密码为sha1(md5(md5(realpass)) + salt)
      salt,
    });

    try {
      // 整套注册机制扣10点
      await rateLimiter.consume(ip, 9);
    } catch (err) {}

    return player;
  }

  /**
   * 返回用户显示名
   */
  getName(): string {
    return this.nickname || this.username;
  }

  /**
   * 获取可以直接访问的用户头像的url地址
   * 主要是处理了一下相对路径
   */
  getAvatarUrl(): string {
    if (this.avatar && this.avatar.startsWith('/')) {
      const apihost = _.get(config, 'apihost', '');
      return apihost + this.avatar;
    }

    return this.avatar;
  }

  /**
   * 获取用于生产JWT数据的payload对象
   */
  getJWTPayload() {
    return {
      uuid: this.uuid,
      name: this.getName(),
      avatar: this.avatar,
    };
  }

  /**
   * 获取用户的好友列表
   */
  async getFriendList(): Promise<PlayerInfoObject[]> {
    const friends: PlayerUser[] = await this.getFriend();
    const friendList = friends.map((i) => i.getInfo());

    return friendList;
  }

  /**
   * 获取用户信息
   * @param includeToken 是否包含token
   */
  getInfo(includeToken = false): PlayerInfoObject {
    return {
      id: this.id,
      uuid: this.uuid,
      username: this.username,
      nickname: this.nickname || this.username,
      last_login: this.last_login,
      avatar: this.avatar,
      token: includeToken ? this.token : '',
      app_token: includeToken ? this.app_token : '',
      sex: this.sex,
      sign: this.sign,
      alignment: this.alignment,
      createAt: this.createdAt,
    };
  }

  /**
   * 更新用户数据。保护数据不更新一些敏感数据
   * @param data 用户数据
   */
  updateInfo(data) {
    // 数据保护
    delete data.id;
    delete data.username;
    delete data.password;
    delete data.uuid;
    delete data.createAt;
    delete data.token;
    delete data.app_token;

    return Object.assign(this, data);
  }
}

export default function PlayerUserDefinition(Sequelize: Orm, db: DBInstance) {
  PlayerUser.init<PlayerUser>(
    {
      uuid: {
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV1,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: { type: Sequelize.STRING, allowNull: false },
      salt: { type: Sequelize.STRING },
      nickname: { type: Sequelize.STRING },
      name: {
        type: Sequelize.VIRTUAL,
        get() {
          return this.nickname || this.username;
        },
      },
      avatar: { type: Sequelize.STRING, defaultValue: '' },
      last_login: { type: Sequelize.DATE },
      last_ip: { type: Sequelize.STRING },
      token: { type: Sequelize.STRING },
      app_token: { type: Sequelize.STRING },
      sex: {
        type: Sequelize.ENUM('男', '女', '其他', '保密'),
        defaultValue: '保密',
      },
      sign: { type: Sequelize.STRING },
      alignment: {
        // https://zh.moegirl.org/zh-hans/%E9%98%B5%E8%90%A5%E4%B9%9D%E5%AE%AB%E6%A0%BC
        type: Sequelize.ENUM(
          'LG',
          'NG',
          'CG',
          'LN',
          'TN',
          'CN',
          'LE',
          'NE',
          'CE'
        ),
        comment:
          '阵营: LG守序善良 NG中立善良 CG混乱善良 LN守序中立 TN绝对中立 CN混乱中立 LE守序邪恶 NE中立邪恶 CE混乱邪恶',
      },
      banned: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      role: {
        type: Sequelize.STRING,
        defaultValue: 'user',
        comment: '角色',
      },
    },
    {
      tableName: 'player_user',
      sequelize: db,
      paranoid: true,
      defaultScope: {
        attributes: {
          exclude: PlayerUser.protectedField,
        },
      },
      scopes: {
        login: {
          attributes: {
            exclude: PlayerUser.passwordField,
          },
        },
      },
      hooks: {
        beforeSave: function(user, options) {
          if (typeof user.last_login === 'string') {
            user.last_login = new Date(user.last_login);
          }
        },
        async afterUpdate(user, options) {
          // 在用户的任意修改操作后清空缓存
          const app = PlayerUser.getApplication();
          await app.cache.remove(getPlayerUserCacheKey(user.uuid));
        },
      },
    }
  );

  PlayerUser.belongsToMany(PlayerUser, {
    through: 'player_friends',
    as: 'friend',
  });

  return PlayerUser;
}
