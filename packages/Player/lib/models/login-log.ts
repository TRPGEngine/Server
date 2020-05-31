import { Orm, DBInstance, Model } from 'trpg/core';
import { PlayerLoginLogType } from 'packages/Player/types/login-log';

export class PlayerLoginLog extends Model {
  id: number;
  user_uuid: string;
  user_name: string;
  type: PlayerLoginLogType;
  channel: string;
  socket_id: string;
  ip: string;
  ip_address: string;
  platform: string;
  device_info: object;
  is_success: boolean;
  token: string;
  offline_date: Date;

  /**
   * 返回用户的登录记录
   * @param userUUID 用户UUID
   * @param size 返回列表大小
   */
  static getPlayerLoginLog(
    userUUID: string,
    size = 10
  ): Promise<PlayerLoginLog[]> {
    return PlayerLoginLog.scope('public').findAll({
      where: {
        user_uuid: userUUID,
      },
      order: [['id', 'DESC']],
      limit: size,
    });
  }
}

export default function PlayerLoginLogDefinition(
  Sequelize: Orm,
  db: DBInstance
) {
  PlayerLoginLog.init(
    {
      user_uuid: { type: Sequelize.STRING },
      user_name: { type: Sequelize.STRING },
      type: {
        type: Sequelize.ENUM('standard', 'token', 'app_standard', 'app_token'),
        required: true,
      },
      channel: { type: Sequelize.STRING },
      socket_id: { type: Sequelize.STRING },
      ip: { type: Sequelize.STRING },
      ip_address: { type: Sequelize.STRING },
      platform: { type: Sequelize.STRING },
      device_info: { type: Sequelize.JSON },
      is_success: { type: Sequelize.BOOLEAN },
      token: { type: Sequelize.STRING },
      offline_date: { type: Sequelize.DATE },
    },
    {
      tableName: 'player_login_log',
      sequelize: db,
      scopes: {
        public: {
          attributes: {
            exclude: ['socket_id', 'ip', 'token'],
          },
        },
      },
    }
  );

  return PlayerLoginLog;
}
