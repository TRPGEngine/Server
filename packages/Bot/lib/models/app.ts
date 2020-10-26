import { Model, Orm, DBInstance } from 'trpg/core';
import _ from 'lodash';
import { PlayerUser } from 'packages/Player/lib/models/user';
import md5Encrypt from 'packages/Player/lib/utils/md5';
import generateUUID from 'uuid/v1';
import sha1Encrypt from 'packages/Player/lib/utils/sha1';

export class BotApp extends Model {
  uuid: string; // 唯一标识 用于邀请机器人加入
  key: string; // 相当于用户名
  secret: string; // 相当于密码
  name: string; // 机器人显示名
  desc: string; // 机器人描述
  website: string; // 机器人网站
  is_public: boolean; // 是否公开 公开的机器人可以被搜索到
  ip_whitelist: string; // ip列表白名单, 用逗号分隔
  usage: number; // 被使用次数, 发起邀请并同意则视为使用了一次。自增1

  userId: number; // 相关用户的id

  /**
   * 根据uuid获取机器人
   */
  static async findByKey(key: string): Promise<BotApp> {
    return BotApp.findOne({
      where: {
        key,
      },
    });
  }

  /**
   * 创建机器人应用
   * @param userUUID 创建者UUID
   * @param name 应用名
   * @param desc 应用密码
   * @param website 应用相关网站
   * @param ip_whitelist ip白名单
   */
  static async createBotApp(
    userUUID: string,
    ip: string,
    name: string,
    desc: string = '',
    website: string = '',
    ip_whitelist: string = ''
  ): Promise<BotApp> {
    const user = PlayerUser.findByUUID(userUUID);
    if (_.isNil(user)) {
      throw new Error('找不到创建用户信息');
    }

    const uuid = generateUUID();
    const key = md5Encrypt(userUUID + uuid);
    const secret = sha1Encrypt(userUUID + Math.random() + uuid);

    const isExist = BotApp.findOne({
      where: {
        name,
      },
    });
    if (!_.isNil(isExist)) {
      throw new Error('该应用已存在相同名字的机器人, 请换个名字再试');
    }

    const appUser = await PlayerUser.registerUser(name, secret, ip);

    const app = await BotApp.create({
      uuid,
      key,
      secret,
      name,
      desc,
      website,
      ip_whitelist,
      userId: appUser.id,
    });

    return app;
  }
}

export default function BotAppDefinition(Sequelize: Orm, db: DBInstance) {
  BotApp.init(
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      key: { type: Sequelize.UUID, allowNull: false },
      secret: { type: Sequelize.STRING, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      desc: { type: Sequelize.STRING },
      website: { type: Sequelize.STRING },
      usage: { type: Sequelize.INTEGER, defaultValue: 0 },
      is_public: { type: Sequelize.BOOLEAN, defaultValue: false },
      ip_whitelist: { type: Sequelize.STRING },
    },
    { tableName: 'bot_app', sequelize: db }
  );

  BotApp.belongsTo(PlayerUser, {
    foreignKey: 'userId',
    as: 'user',
  });

  return BotApp;
}
