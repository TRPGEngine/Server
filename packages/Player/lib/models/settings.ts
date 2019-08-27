import { Model, Orm, DBInstance } from 'trpg/core';
import _ from 'lodash';

type SettingValue = string | number | boolean;

interface UserSetting {
  [key: string]: SettingValue;
}

interface SystemSetting {
  [key: string]: SettingValue;
}

export class PlayerSettings extends Model {
  user_uuid: string;
  user_settings: UserSetting;
  system_settings: SystemSetting;

  /**
   * 根据uuid获取用户设置
   * @param uuid 用户UUID
   */
  static getByUserUUID(uuid: string): Promise<PlayerSettings> {
    return PlayerSettings.findOne({
      where: {
        user_uuid: uuid,
      },
    });
  }

  /**
   * 获取用户设置
   * @param key 键
   */
  getUserSetting(key: string): SettingValue {
    return _.get(this.user_settings, key);
  }

  /**
   * 获取系统设置
   * @param key 键
   */
  getSystemSetting(key: string): SettingValue {
    return _.get(this.system_settings, key);
  }

  /**
   * 设置用户设置
   * @param key 键
   * @param value 值
   */
  setUserSetting(key: string, value: any): Promise<this> {
    _.set(this.user_settings, key, value);

    return this.save();
  }

  /**
   * 设置系统设置
   * @param key 键
   * @param value 值
   */
  setSystemSetting(key: string, value: any): Promise<this> {
    _.set(this.system_settings, key, value);

    return this.save();
  }
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
