import { generateRandomStr } from 'lib/helper/string-helper';
import _ from 'lodash';
import { Model, Orm, DBInstance } from 'trpg/core';

/**
 * OAuth 授权记录
 */

export class OAuthCode extends Model {
  static async createCode(appid: string, scope: string[]): Promise<string> {
    const res = await OAuthCode.create({
      appid,
      scope: scope.join(','),
    });

    return res.code;
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

  return OAuthCode;
}
