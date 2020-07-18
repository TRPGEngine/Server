import uuid from 'uuid/v1';
import { Model, Orm, DBInstance } from 'trpg/core';

export class PlayerInvite extends Model {
  uuid: string;
  from_uuid: string;
  to_uuid: string;
  is_agree: boolean;
  is_refuse: boolean;

  /**
   * 获取所有未处理的好友邀请
   * @param userUUID 用户UUID
   */
  static async getAllUnprocessedInvites(
    userUUID: string
  ): Promise<PlayerInvite[]> {
    return PlayerInvite.findAll({
      where: {
        to_uuid: userUUID,
        is_agree: false,
        is_refuse: false,
      },
    });
  }
}

export default function PlayerInviteDefinition(Sequelize: Orm, db: DBInstance) {
  PlayerInvite.init<PlayerInvite>(
    {
      uuid: {
        type: Sequelize.STRING,
        required: false,
        unique: true,
      },
      from_uuid: { type: Sequelize.STRING, required: true },
      to_uuid: { type: Sequelize.STRING, required: true },
      is_agree: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_refuse: { type: Sequelize.BOOLEAN, defaultValue: false },
    },
    {
      tableName: 'player_invite',
      sequelize: db,
      hooks: {
        beforeCreate: function(invite) {
          if (!invite.uuid) {
            invite.uuid = uuid();
          }
        },
      },
    }
  );

  return PlayerInvite;
}
