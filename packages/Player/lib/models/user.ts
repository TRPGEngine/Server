import md5Encrypt from '../utils/md5';
import randomString from 'crypto-random-string';
import { Model, DBInstance, Orm } from 'trpg/core';

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

  static findByUUID(userUUID: string): Promise<PlayerUser> {
    return PlayerUser.findOne({
      where: {
        uuid: userUUID,
      },
    });
  }

  getName(): string {
    return this.nickname || this.username;
  }

  getJWTPayload() {
    return {
      uuid: this.uuid,
      name: this.getName(),
      avatar: this.avatar,
    };
  }

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
