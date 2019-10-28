import { Orm, DBInstance, Model } from 'trpg/core';

export class GroupInvite extends Model {}

export default function GroupInviteDefinition(Sequelize: Orm, db: DBInstance) {
  GroupInvite.init(
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      group_uuid: { type: Sequelize.UUID, required: true },
      from_uuid: { type: Sequelize.UUID, required: true },
      to_uuid: { type: Sequelize.UUID, required: true },
      is_agree: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_refuse: { type: Sequelize.BOOLEAN, defaultValue: false },
    },
    {
      tableName: 'group_invite',
      sequelize: db,
    }
  );

  return GroupInvite;
}
