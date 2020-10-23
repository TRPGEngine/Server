import { Model, Orm, DBInstance } from 'trpg/core';
import _ from 'lodash';
import { PlayerUser } from 'packages/Player/lib/models/user';

export class BotApp extends Model {
  uuid: string; // 唯一标识 用于邀请机器人加入
  key: string; // 相当于用户名
  secret: string; // 相当于密码
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
}

export default function BotAppDefinition(Sequelize: Orm, db: DBInstance) {
  BotApp.init(
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      key: { type: Sequelize.UUID, allowNull: false },
      secret: { type: Sequelize.STRING, allowNull: false },
      desc: { type: Sequelize.STRING },
      website: { type: Sequelize.STRING },
      usage: { type: Sequelize.INTEGER },
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
