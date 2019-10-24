import md5Encrypt from '../utils/md5';
import sha1Encrypt from '../utils/sha1';
import randomString from 'crypto-random-string';
import { Model, DBInstance, Orm } from 'trpg/core';
import config from 'config';
import _ from 'lodash';
import { fn, col } from 'sequelize';

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

export class PlayerUser extends Model {
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
  sign: string;
  alignment: Alignment;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;

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

    const cachedJWT = await app.cache.get(cacheKey);
    if (_.isString(cachedJWT) && cachedJWT !== '') {
      return cachedJWT;
    }

    const user = await PlayerUser.findByUUID(uuid);

    const jwt = app.jwtSign({
      uuid: user.uuid,
      name: user.getName(),
      avatar: user.getAvatarUrl(),
    });

    await app.cache.set(cacheKey, jwt, { expires: 1000 * 60 * 60 * 12 });

    return jwt;
  }

  /**
   * 根据用户UUID查找用户
   * @param userUUID 用户UUID
   */
  static findByUUID(userUUID: string): Promise<PlayerUser> {
    return PlayerUser.findOne({
      where: {
        uuid: userUUID,
      },
    });
  }

  /**
   * 根据用户名和密码查找用户
   * @param username 用户名
   * @param password 密码
   */
  static findByUsernameAndPassword(
    username: string,
    password: string
  ): Promise<PlayerUser> {
    return PlayerUser.findOne({
      where: {
        username,
        password: fn('SHA1', fn('CONCAT', fn('MD5', password), col('salt'))),
      },
    });
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
   * 获取用户信息
   * @param includeToken 是否包含token
   */
  getInfo(includeToken = false) {
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
    },
    {
      tableName: 'player_user',
      sequelize: db,
      paranoid: true,
      hooks: {
        beforeSave: function(user, options) {
          if (typeof user.last_login === 'string') {
            user.last_login = new Date(user.last_login);
          }
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
