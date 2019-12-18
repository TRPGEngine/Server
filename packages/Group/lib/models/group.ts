import {
  Orm,
  DBInstance,
  Model,
  BelongsToManyAddAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyHasAssociationsMixin,
  BelongsToSetAssociationMixin,
  Op,
  BelongsToManyRemoveAssociationMixin,
} from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';
import { GroupActor } from './actor';
import _ from 'lodash';
import { ChatLog } from 'packages/Chat/lib/models/log';

type GroupType = 'group' | 'channel' | 'test';

declare module 'packages/Player/lib/models/user' {
  interface PlayerUser {
    getGroups?: BelongsToManyGetAssociationsMixin<GroupGroup>;
  }
}

export class GroupGroup extends Model {
  id: number;
  uuid: string;
  type: GroupType;
  name: string;
  sub_name: string;
  desc: string;
  avatar: string;
  max_member: number;
  allow_search: boolean;
  creator_uuid: string;
  owner_uuid: string;
  managers_uuid: string[];
  maps_uuid: string[];

  setOwner?: BelongsToSetAssociationMixin<PlayerUser, number>;
  addMember?: BelongsToManyAddAssociationMixin<PlayerUser, number>;
  getMembers?: BelongsToManyGetAssociationsMixin<PlayerUser>;
  hasMembers?: BelongsToManyHasAssociationsMixin<PlayerUser, number>;
  removeMember?: BelongsToManyRemoveAssociationMixin<PlayerUser, number>;

  /**
   * 根据UUID查找团
   * @param groupUUID 团UUID
   */
  static findByUUID(groupUUID: string): Promise<GroupGroup> {
    return GroupGroup.findOne({
      where: {
        uuid: groupUUID,
      },
    });
  }

  /**
   * 根据团UUID获取团UUID列表
   * @param groupUUID 团UUID
   */
  static async findGroupActorsByUUID(groupUUID: string): Promise<GroupActor> {
    const group: GroupActor = await GroupGroup.findOne({
      where: {
        uuid: groupUUID,
      },
      include: ['groupActors'],
    });

    return _.get(group, 'groupActors', []);
  }

  /**
   * 搜索团
   * @param text 搜索文本
   * @param type 搜索方式
   */
  static async searchGroup(
    text: string,
    type: 'uuid' | 'groupname' | 'groupdesc'
  ): Promise<GroupGroup[]> {
    if (_.isNil(text) || _.isNil(type)) {
      throw new Error('缺少必要参数');
    }

    const limit = 10;

    if (type === 'uuid') {
      return await GroupGroup.findAll({
        where: { allow_search: true, uuid: text },
        limit,
      });
    }

    if (type === 'groupname') {
      return await GroupGroup.findAll({
        where: {
          allow_search: true,
          name: {
            [Op.like]: `%${text}%`,
          },
        },
        limit,
      });
    }

    if (type === 'groupdesc') {
      return await GroupGroup.findAll({
        where: {
          allow_search: true,
          desc: {
            [Op.like]: `%${text}%`,
          },
        },
        limit,
      });
    }

    return [];
  }

  /**
   * 添加团成员
   * @param groupUUID 团UUID
   * @param userUUID 要加入的用户的UUID
   * @param operatorUserUUID 操作者的UUID, 如果有输入则进行权限校验
   */
  static async addGroupMember(
    groupUUID: string,
    userUUID: string,
    operatorUserUUID?: string
  ): Promise<void> {
    if (_.isNil(groupUUID) || _.isNil(userUUID)) {
      throw new Error('缺少必要字段');
    }

    const group = await GroupGroup.findByUUID(groupUUID);
    if (_.isNil(group)) {
      throw new Error('找不到该团');
    }

    if (
      _.isString(operatorUserUUID) &&
      !group.isManagerOrOwner(operatorUserUUID)
    ) {
      throw new Error('没有添加成员权限');
    }

    const user = await PlayerUser.findByUUID(userUUID);
    if (_.isNil(user)) {
      throw new Error('该用户不存在');
    }

    const exist = await group.hasMembers([user]);
    if (exist) {
      throw new Error('该用户已经在团中');
    }

    await group.addMember(user);

    const app = GroupGroup.getApplication();

    if (app.player) {
      if (await app.player.manager.checkPlayerOnline(user.uuid)) {
        // 检查加入团的成员是否在线, 如果在线则发送一条更新通知要求其更新团信息
        app.player.manager.unicastSocketEvent(
          user.uuid,
          'group::addGroupSuccess',
          { group }
        );
        app.player.manager.joinRoomWithUUID(group.uuid, user.uuid);
      }

      // TODO: 通知团其他所有人更新团成员信息
    }
  }

  /**
   * 移除团成员
   * @param groupUUID 团UUID
   * @param userUUID 要移除的用户的UUID
   * @param operatorUserUUID 操作者的UUID, 如果有输入则进行权限校验
   */
  static async removeGroupMember(
    groupUUID: string,
    userUUID: string,
    operatorUserUUID?: string
  ) {
    const group = await GroupGroup.findByUUID(groupUUID);
    if (_.isNil(group)) {
      throw '找不到团';
    }

    if (group.owner_uuid === userUUID) {
      throw '作为团主持人你无法直接退出群';
    }

    const user = await PlayerUser.findByUUID(userUUID);
    if (_.isNil(user)) {
      throw '找不到用户';
    }

    await group.removeMember(user);

    // 系统通知所有团管理员
    const managers_uuid = group.getManagerUUIDs();
    const systemMsg = `用户 ${user.getName()} 退出了团 [${group.name}]`;
    managers_uuid.forEach((uuid) => {
      if (uuid !== user.uuid) {
        ChatLog.sendSimpleSystemMsg(uuid, null, systemMsg);
      }
    });

    // 离开房间
    const app = GroupGroup.getApplication();
    await app.player.manager.leaveRoomWithUUID(group.uuid, userUUID);
  }

  /**
   * 发送加入成员的系统通知
   */
  async sendAddMemberNotify(memberUUID: string) {
    const user = await PlayerUser.findByUUID(memberUUID);
    const name = user.getName();

    await ChatLog.sendSimpleSystemMsg(null, this.uuid, `${name} 加入本团`);
  }

  /**
   * 判断用户是否是该团的管理人员
   * @param uuid 用户UUID
   */
  isManagerOrOwner(uuid: string): boolean {
    if (
      this.creator_uuid === uuid ||
      this.owner_uuid === uuid ||
      this.managers_uuid.indexOf(uuid) >= 0
    ) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * 判断是否为团所有者
   */
  isOwner(uuid: string): boolean {
    return this.owner_uuid === uuid;
  }

  /**
   * 获取管理人员列表
   */
  getManagerUUIDs(): string[] {
    return Array.from(new Set([this.owner_uuid].concat(this.managers_uuid)));
  }
}

export default function GroupGroupDefinition(Sequelize: Orm, db: DBInstance) {
  GroupGroup.init(
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      type: { type: Sequelize.ENUM('group', 'channel', 'test') },
      name: { type: Sequelize.STRING },
      sub_name: { type: Sequelize.STRING },
      desc: { type: Sequelize.STRING },
      avatar: { type: Sequelize.STRING, defaultValue: '' },
      max_member: { type: Sequelize.INTEGER, defaultValue: 50 }, // 最大人数 默认50
      allow_search: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: '是否允许被搜索',
      },
      creator_uuid: { type: Sequelize.STRING, required: true },
      owner_uuid: { type: Sequelize.STRING, required: true },
      managers_uuid: { type: Sequelize.JSON, defaultValue: [] },
      maps_uuid: { type: Sequelize.JSON, defaultValue: [] },
    },
    {
      tableName: 'group_group',
      sequelize: db,
      paranoid: true,
      hooks: {
        beforeCreate(group) {
          if (!Array.isArray(group.managers_uuid)) {
            group.managers_uuid = [];
          }
          if (group.managers_uuid.indexOf(group.owner_uuid) === -1) {
            group.managers_uuid.push(group.owner_uuid);
          }
        },
      },
    }
  );

  GroupGroup.belongsTo(PlayerUser, {
    as: 'owner',
  });

  // 定义group members的中间模型
  let GroupMembers = db.define('group_group_members', {
    selected_group_actor_uuid: { type: Sequelize.STRING },
  });
  PlayerUser.belongsToMany(GroupGroup, {
    through: GroupMembers,
    as: 'groups',
  });
  GroupGroup.belongsToMany(PlayerUser, {
    through: GroupMembers,
    as: 'members',
  });

  return GroupGroup;
}
