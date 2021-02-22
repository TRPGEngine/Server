import { Model, Orm, DBInstance } from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';

/**
 * 邮件列表
 */
export class MailList extends Model {
  user_uuid: string;
  email_address: string;
  email_user: string;
  email_provider: string;
  enabled: boolean;
}

export default function MailListDefinition(Sequelize: Orm, db: DBInstance) {
  MailList.init(
    {
      user_uuid: { type: Sequelize.UUID, required: true },
      email_address: {
        type: Sequelize.STRING,
        required: true,
        validate: { isEmail: true },
      },
      email_user: { type: Sequelize.STRING },
      email_provider: { type: Sequelize.STRING },
      enabled: { type: Sequelize.BOOLEAN, defaultValue: false },
    },
    {
      tableName: 'mail_list',
      sequelize: db,
      hooks: {
        beforeCreate: function (item) {
          if (!item.email_user) {
            item.email_user = item.email_address.split('@')[0];
          }
          if (!item.email_provider) {
            item.email_provider = item.email_address.split('@')[1];
          }
        },
        beforeSave: function (item) {
          if (!item.email_user) {
            item.email_user = item.email_address.split('@')[0];
          }
          if (!item.email_provider) {
            item.email_provider = item.email_address.split('@')[1];
          }
        },
      },
    }
  );

  // List.hasOne('owner', User, { reverse: "mail" });
  MailList.belongsTo(PlayerUser, {
    foreignKey: 'ownerId',
    as: 'owner',
  });
  PlayerUser.hasOne(MailList, {
    foreignKey: 'ownerId',
    as: 'mail',
  });

  return MailList;
}
