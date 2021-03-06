import { generateRandomStr } from 'lib/helper/string-helper';
import _ from 'lodash';
import { PlayerUser } from 'packages/Player/lib/models/user';
import { Model, Orm, DBInstance } from 'trpg/core';

/**
 * OAuth 接入应用
 */

type AppPublicFieldType = typeof OAuthApp.APP_PUBLIC_FIELD[number];

export class OAuthApp extends Model {
  appid: string;
  appsecret: string;
  name: string;
  icon?: string;
  website?: string;

  static APP_PUBLIC_FIELD = ['appid', 'name', 'icon', 'website'] as const;

  static async findByAppId(
    appid: string,
    options?: { includeSecret?: boolean }
  ): Promise<OAuthApp | null> {
    if (options?.includeSecret === true) {
      return OAuthApp.scope().findOne({
        where: {
          appid,
        },
      });
    } else {
      return OAuthApp.findOne({
        where: {
          appid,
        },
      });
    }
  }

  /**
   * 获取OAuth应用信息
   * @param appid 应用ID
   */
  static async getAppInfo(
    appid: string
  ): Promise<Pick<OAuthApp, AppPublicFieldType> | null> {
    const app = await OAuthApp.findOne({
      where: {
        appid,
      },
    });

    if (_.isNil(app)) {
      return null;
    }

    return _.pick(app, OAuthApp.APP_PUBLIC_FIELD);
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
