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

  /**
   * 根据邀请代码获取邀请信息
   * @param code 邀请代码
   */
  static async findByCode(code: string): Promise<GroupInviteCode> {
    return GroupInviteCode.findOne({
      where: {
        code,
      },
    });
  }

  /**
   * 创建一条邀请
   * @param groupUUID 团UUID
   * @param userUUID 操作人员UUID
   * @param options 选项
   */
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

  /**
   * 通过邀请代码(地址)加入团
   * @param inviteCode 邀请代码
   * @param userUUID 使用邀请代码的用户UUID
   */
  static async joinGroupWithCode(
    inviteCode: string,
    userUUID: string
  ): Promise<void> {
    const invite = await GroupInviteCode.findByCode(inviteCode);
    if (_.isNil(invite)) {
      throw new Error('找不到邀请信息');
    }
    const groupUUID = invite.group_uuid;
    await GroupGroup.addGroupMember(groupUUID, userUUID);
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
