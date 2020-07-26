import uuid from 'uuid/v1';
import { Model, Orm, DBInstance } from 'trpg/core';
import { notifyAddInvite } from '../notify';
import { PlayerUser } from 'packages/Player/lib/models/user';

export class PlayerInvite extends Model {
  id: number;
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

  /**
   * 发送好友请求
   * @param fromUUID 发送者的UUID
   * @param toUUID 接收者的UUID
   */
  static async sendFriendInvite(
    fromUUID: string,
    toUUID: string
  ): Promise<PlayerInvite> {
    if (fromUUID === toUUID) {
      throw new Error('不能请求成为自己的好友');
    }

    const inviteIsExist = await PlayerInvite.findOne({
      where: {
        from_uuid: fromUUID,
        to_uuid: toUUID,
        is_agree: false,
        is_refuse: false,
      },
    });

    if (!!inviteIsExist) {
      throw new Error('重复请求');
    }

    const invite = await PlayerInvite.create({
      from_uuid: fromUUID,
      to_uuid: toUUID,
    });
    notifyAddInvite(toUUID, invite);

    const trpgapp = PlayerInvite.getApplication();
    const user = await PlayerUser.findByUUID(fromUUID);
    if (trpgapp.chat?.sendSystemMsg) {
      const msg = `${user.getName()} 想添加您为好友`;
      trpgapp.chat.sendSystemMsg(toUUID, 'friendInvite', '好友邀请', msg, {
        invite,
      });
    }

    return invite;
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
