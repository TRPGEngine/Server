import { ExpiredError, NotFoundError } from 'lib/error';
import { generateRandomStr } from 'lib/helper/string-helper';
import _ from 'lodash';
import { PlayerUser } from 'packages/Player/lib/models/user';
import { PlayerInfoObject } from 'packages/Player/types/player';
import {
  Model,
  Orm,
  DBInstance,
  BelongsToGetAssociationMixin,
} from 'trpg/core';
import { OAuthApp } from './app';

/**
 * OAuth 授权记录
 */

export class OAuthCode extends Model {
  appid: string;
  code: string;
  scope: string;
  expiredAt: string;

  getUser?: BelongsToGetAssociationMixin<PlayerUser>;

  static async createCode(
    appid: string,
    scope: string[],
    playerUUID: string
  ): Promise<string> {
    const user = await PlayerUser.findByUUID(playerUUID);

    const res = await OAuthCode.create({
      appid,
      scope: scope.join(','),
      userId: user.id,
    });

    return res.code;
  }

  /**
   * 校验授权是否可用, 如果可用则返回授权信息
   * @param appid 应用id
   * @param appsecret 应用秘钥
   * @param code 授权代码
   */
  static async verifyCode(
    appid: string,
    appsecret: string,
    code: string
  ): Promise<OAuthCode> {
    const oauthApp = await OAuthApp.findByAppId(appid, {
      includeSecret: true,
    });
    if (_.isNil(oauthApp)) {
      throw new NotFoundError('找不到授权应用, 请检查appid');
    }

    if (oauthApp.appsecret !== appsecret) {
      throw new Error('授权应用秘钥不正确, 请检查appsecret');
    }

    const oauthCode: OAuthCode = await OAuthCode.findOne({
      where: {
        appid,
        code,
      },
    });

    if (_.isNil(oauthCode)) {
      throw new NotFoundError('找不到授权信息');
    }

    if (new Date(oauthCode.expiredAt).valueOf() < new Date().valueOf()) {
      throw new ExpiredError('授权已过期');
    }

    return oauthCode;
  }

  /**
   * 获取用户公开的数据
   */
  static async getUserPublicScope(
    appid: string,
    appsecret: string,
    code: string
  ): Promise<PlayerInfoObject> {
    const oauthCode = await OAuthCode.verifyCode(appid, appsecret, code);

    if (!oauthCode.scope.includes('public')) {
      throw new Error('没有 public 授权');
    }

    const user: PlayerUser = await oauthCode.getUser();
    const info = user.getInfo();

    return info;
  }
}

export default function OAuthCodeDefinition(Sequelize: Orm, db: DBInstance) {
  OAuthCode.init(
    {
      appid: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: () => generateRandomStr(32),
      },
      scope: {
        type: Sequelize.STRING,
        defaultValue: 'public',
      },
      expiredAt: {
        type: Sequelize.DATE,
        defaultValue: () => new Date().setDate(new Date().getDate() + 30),
      },
    },
    {
      tableName: 'oauth_code',
      sequelize: db,
    }
  );

  OAuthCode.belongsTo(PlayerUser, {
    foreignKey: 'userId',
    as: 'user',
  });

  return OAuthCode;
}
