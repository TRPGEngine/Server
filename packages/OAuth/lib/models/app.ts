import { Model, Orm, DBInstance } from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';

// OAuth 接入应用

export class OAuthApp extends Model {
  appid: string;
  appsecret: string;
}

export default function OAuthAppDefinition(Sequelize: Orm, db: DBInstance) {
  OAuthApp.init(
    {
      appid: {
        type: Sequelize.STRING,
        required: true,
      },
      appsecret: {
        type: Sequelize.UUID,
        required: true,
      },
    },
    { tableName: 'oauth_app', sequelize: db }
  );

  return OAuthApp;
}
