import { Model } from 'trpg/core';

export class NotifyHistory extends Model {
  type: string;
  platform: string;
  registration_id: string; // 设备唯一标识
  user_uuid: string;
  user_tags: {};
  notification: string;
  message: string;
}

export default function NotifyHistoryDefinition(Sequelize, db) {
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
      },
      title: {
        type: Sequelize.STRING,
      },
      message: {
        type: Sequelize.STRING,
      },
    },
    {
      tableName: 'notify_history',
      sequelize: db,
    }
  );

  return NotifyHistory;
}
