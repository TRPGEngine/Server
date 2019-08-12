import { Model, Orm, DBInstance } from 'trpg/core';

export class NotifyHistory extends Model {
  type: string;
  platform: string;
  registration_id: string; // 设备唯一标识
  user_uuid: string;
  user_tags: {};
  notification: string;
  message: string;
}

export default function NotifyHistoryDefinition(
  Sequelize: Orm,
  db: DBInstance
) {
  NotifyHistory.init(
    {
      type: {
        type: Sequelize.ENUM('jpush', 'upush'),
        required: true,
      },
      platform: {
        type: Sequelize.ENUM('all', 'android', 'ios'),
      },
      registration_id: {
        type: Sequelize.STRING,
      },
      user_uuid: {
        type: Sequelize.UUID,
      },
      user_tags: {
        type: Sequelize.JSON,
        comment:
          'user tags when send notify use. if not use any user tag to send, keep it null',
      },
      title: {
        type: Sequelize.STRING,
      },
      message: {
        type: Sequelize.STRING,
      },
      data: {
        type: Sequelize.JSON,
      },
    },
    {
      tableName: 'notify_history',
      sequelize: db,
    }
  );

  return NotifyHistory;
}
