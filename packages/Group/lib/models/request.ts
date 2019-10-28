import { Orm, DBInstance, Model } from 'trpg/core';

export class GroupRequest extends Model {
  uuid: string;
  group_uuid: string;
  from_uuid: string;
  is_agree: boolean;
  is_refuse: boolean;

  async agreeAsync() {
    this.is_agree = true;
    this.is_refuse = false;
    return await this.save();
  }

  async refuseAsync() {
    this.is_agree = false;
    this.is_refuse = true;
    return await this.save();
  }
}

export default function GroupRequestDefinition(Sequelize: Orm, db: DBInstance) {
  GroupRequest.init(
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      group_uuid: { type: Sequelize.UUID, required: true },
      from_uuid: { type: Sequelize.UUID, required: true },
      is_agree: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_refuse: { type: Sequelize.BOOLEAN, defaultValue: false },
    },
    {
      tableName: 'group_request',
      sequelize: db,
    }
  );

  return GroupRequest;
}
