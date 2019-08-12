import { Model, Orm, DBInstance } from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';

// 极光推送

export class NotifyJPush extends Model {
  registration_id: string;
  user_uuid: string;
  user_tags: string[];
  is_active: boolean;

  addTag(tag: string) {
    const tags = this.user_tags;
    tags.push(tag);
    return this.save();
  }
}

export default function NotifyJPushDefinition(Sequelize: Orm, db: DBInstance) {
  NotifyJPush.init(
    {
      registration_id: {
        type: Sequelize.STRING,
        required: true,
      },
      user_uuid: {
        type: Sequelize.UUID,
        required: true,
      },
      user_tags: {
        type: Sequelize.JSON,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
      },
    },
    { tableName: 'notify_jpush', sequelize: db }
  );

  NotifyJPush.belongsTo(PlayerUser, { as: 'user' });

  return NotifyJPush;
}
