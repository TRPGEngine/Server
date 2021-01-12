import { PlayerUser } from 'packages/Player/lib/models/user';
import { Model, Orm, DBInstance } from 'trpg/core';

// OAuth 接入应用

export class OAuthApp extends Model {
  appid: string;
  appsecret: string;
  name: string;
  icon: string;
  website: string;

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
}

export default function OAuthAppDefinition(Sequelize: Orm, db: DBInstance) {
  OAuthApp.init(
    {
      appid: {
        type: Sequelize.STRING,
        required: true,
      },
      appsecret: {
        type: Sequelize.STRING,
        required: true,
      },
      name: {
        type: Sequelize.STRING,
        required: true,
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
