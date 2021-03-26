import { Orm, DBInstance, Model } from 'trpg/core';
import { GroupGroup } from './group';
import _ from 'lodash';

type GroupInviteRequiredProps = Pick<
  GroupInvite,
  'group_uuid' | 'from_uuid' | 'to_uuid'
>;

export class GroupInvite extends Model {
  uuid: string;
  group_uuid: string;
  from_uuid: string;
  to_uuid: string;
  is_agree: boolean;
  is_refuse: boolean;

  /**
   * 创建一条团邀请
   * @param groupUUID 团UUID
   * @param from_uuid 邀请人UUID
   * @param targetUUIDs 被邀请人UUID
   */
  static async createInvites(
    groupUUID: string,
    fromUUID: string,
    targetUUIDs: string[]
  ): Promise<GroupInvite[]> {
    if (targetUUIDs.includes(fromUUID)) {
      throw new Error('你不能邀请你自己');
    }

    const group: GroupGroup = await GroupGroup.findOne({
      where: {
        uuid: groupUUID,
      },
    });
    if (_.isNil(group)) {
      throw new Error('该团不存在');
    }

    if (!group.isManagerOrOwner(fromUUID)) {
      throw new Error('抱歉您不是该团管理员没有邀请权限');
    }

    // TODO: 没有想好怎么处理重复发送的问题。先不处理

    const records = targetUUIDs.map<GroupInviteRequiredProps>((uuid) => ({
      group_uuid: groupUUID,
      from_uuid: fromUUID,
      to_uuid: uuid,
    }));
    const invites: GroupInvite[] = await GroupInvite.bulkCreate(records);
    return invites;
  }

  /**
   * 获取所有未处理的团邀请列表
   * 未处理的定义: 未同意且未拒绝
   */
  static async getAllPendingInvites(
    playerUUID: string
  ): Promise<GroupInvite[]> {
    const invites = await GroupInvite.findAll({
      where: {
        to_uuid: playerUUID,
        is_agree: false,
        is_refuse: false,
      },
    });

    return invites;
  }

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
