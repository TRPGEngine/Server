import { Model, Orm, DBInstance } from 'trpg/core';

export class PlayerSettings extends Model {
  user_uuid: string;
  user_settings: any;
  system_settings: any;
}

export default function PlayerSettingsDefinition(
  Sequelize: Orm,
  db: DBInstance
) {
  PlayerSettings.init(
    {
      user_uuid: { type: Sequelize.STRING, unique: true },
      user_settings: { type: Sequelize.JSON },
      system_settings: { type: Sequelize.JSON },
    },
    {
      tableName: 'player_settings',
      sequelize: db,
    }
  );

  return PlayerSettings;
}
