import md5Encrypt from '../utils/md5';
import sha1Encrypt from '../utils/sha1';
import randomString from 'crypto-random-string';
import { Model, DBInstance, Orm } from 'trpg/core';
import config from 'config';
import _ from 'lodash';
import { fn, col } from 'sequelize/types';

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
      username: this.username,
      nickname: this.nickname || this.username,
      uuid: this.uuid,
      last_login: this.last_login,
      createAt: this.createdAt,
      id: this.id,
      avatar: this.avatar,
      token: includeToken ? this.token : '',
      app_token: includeToken ? this.app_token : '',
      sex: this.sex,
      sign: this.sign,
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
        required: true,
        unique: true,
      },
      password: { type: Sequelize.STRING, required: true },
      salt: { type: Sequelize.STRING },
      nickname: { type: Sequelize.STRING, required: false },
      name: {
        type: Sequelize.VIRTUAL,
        get() {
          return this.nickname || this.username;
        },
      },
      avatar: { type: Sequelize.STRING, required: false, defaultValue: '' },
      last_login: { type: Sequelize.DATE },
      last_ip: { type: Sequelize.STRING },
      token: { type: Sequelize.STRING },
      app_token: { type: Sequelize.STRING },
      sex: {
        type: Sequelize.ENUM('男', '女', '其他', '保密'),
        defaultValue: '保密',
      },
      sign: { type: Sequelize.STRING },
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
