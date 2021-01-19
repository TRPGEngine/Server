import { generateRandomStr } from 'lib/helper/string-helper';
import { PlayerUser } from 'packages/Player/lib/models/user';
import { Model, Orm, DBInstance } from 'trpg/core';

/**
 * OAuth 接入应用
 */

export class OAuthApp extends Model {
  appid: string;
  appsecret: string;
  name: string;
  icon?: string;
  website?: string;

  /**
   * 获取OAuth应用信息
   * @param appid 应用ID
   */
  static async getAppInfo(appid: string): Promise<Omit<OAuthApp, 'appsecret'>> {
    const app = await OAuthApp.findOne({
      where: {
        appid,
      },
    });

    delete app.appsecret;

    return app;
  }

  /**
   * 创建新的 OAuth 应用
   * @param info 应用信息
   * @param playerUUID 创建者UUID
   */
  static async createApp(
    info: Pick<OAuthApp, 'name' | 'icon' | 'website'>,
    playerUUID: string
  ): Promise<OAuthApp> {
    const user = await PlayerUser.findByUUID(playerUUID);

    const isExist = await OAuthApp.findOne({
      where: {
        name: info.name,
      },
    });

    if (isExist) {
      throw new Error('应用名重复');
    }

    const app = await OAuthApp.create({ ...info, ownerId: user.id });

    return app;
  }
}

export default function OAuthAppDefinition(Sequelize: Orm, db: DBInstance) {
  OAuthApp.init(
    {
      appid: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        defaultValue: () => generateRandomStr(24),
      },
      appsecret: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: () => generateRandomStr(32),
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      icon: {
        type: Sequelize.STRING,
      },
      website: {
        type: Sequelize.STRING,
      },
    },
    {
      tableName: 'oauth_app',
      sequelize: db,
      defaultScope: {
        attributes: {
          exclude: ['appsecret'],
        },
      },
    }
  );

  OAuthApp.belongsTo(PlayerUser, {
    foreignKey: 'ownerId',
    as: 'owner',
  });

  return OAuthApp;
}
