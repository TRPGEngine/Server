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

  /**
   * 同意团邀请
   * @param inviteUUID 邀请UUID
   * @param operatorUUID 操作人UUID
   */
  static async agreeInvite(
    inviteUUID: string,
    operatorUUID: string
  ): Promise<GroupInvite> {
    const invite: GroupInvite = await GroupInvite.findOne({
      where: {
        uuid: inviteUUID,
        to_uuid: operatorUUID,
      },
    });
    if (_.isNil(invite)) {
      throw new Error('同意邀请失败: 该邀请不存在');
    }
    const groupUUID = invite.group_uuid;
    const group = await GroupGroup.findByUUID(groupUUID);
    if (!group) {
      throw new Error('同意邀请失败: 该团不存在');
    }

    const trpgapp = GroupInvite.getApplication();
    const db = trpgapp.storage.db;
    await db.transactionAsync(async () => {
      await GroupGroup.addGroupMember(groupUUID, operatorUUID);
      await invite.agreeAsync();
      _.set(invite, 'dataValues.group', group); // 这个是为了socket的返回值
    });

    return invite;
  }

  /**
   * 拒绝团邀请
   * @param inviteUUID 邀请UUID
   * @param operatorUUID 操作人UUID
   */
  static async refuseInvite(
    inviteUUID: string,
    operatorUUID: string
  ): Promise<GroupInvite> {
    const invite: GroupInvite = await GroupInvite.findOne({
      where: {
        uuid: inviteUUID,
        to_uuid: operatorUUID,
      },
    });
    if (_.isNil(invite)) {
      throw new Error('拒绝邀请失败: 该邀请不存在');
    }

    // 不检测团是否存在，直接拒绝

    await invite.refuseAsync();

    return invite;
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
