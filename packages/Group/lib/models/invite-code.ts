import { Model, Orm, DBInstance } from 'trpg/core';
import shortid from 'shortid';
import { GroupGroup } from 'packages/Group/lib/models/group';
import _ from 'lodash';

/**
 * 新的团邀请模式
 * discord like
 */

interface GroupInviteCodeOption {
  expiredAt?: Date;
  times?: number;
}

export class GroupInviteCode extends Model {
  code: string;
  group_uuid: string;
  from_uuid: string;
  expiredAt: Date;
  times: number;

  static async createInvite(
    groupUUID: string,
    userUUID: string,
    options?: GroupInviteCodeOption
  ): Promise<GroupInviteCode> {
    const group = await GroupGroup.findByUUID(groupUUID);
    if (!group) {
      throw new Error('找不到团信息');
    }

    const isManager = group.isManagerOrOwner(userUUID);
    if (!isManager) {
      throw new Error('无权创建邀请');
    }

    options = _.pick(options, ['expiredAt', 'times']);

    const inviteCode = await GroupInviteCode.create({
      ...options,
      group_uuid: groupUUID,
      from_uuid: userUUID,
    });

    return inviteCode;
  }
}

export default function GroupInviteCodeDefinition(
  Sequelize: Orm,
  db: DBInstance
) {
  GroupInviteCode.init(
    {
      code: {
        type: Sequelize.STRING,
        defaultValue: () => shortid.generate(),
        required: true,
        unique: true,
      },
      group_uuid: { type: Sequelize.UUID, required: true },
      from_uuid: { type: Sequelize.UUID, required: true },
      expiredAt: { type: Sequelize.DATE },
      times: { type: Sequelize.INTEGER, defaultValue: -1 },
    },
    {
      tableName: 'group_invite_code',
      sequelize: db,
    }
  );

  return GroupInviteCode;
}
