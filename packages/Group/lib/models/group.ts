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
  BelongsToManyHasAssociationMixin,
  BelongsToManyCountAssociationsMixin,
} from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';
import { GroupActor } from './actor';
import _ from 'lodash';
import { ChatLog } from 'packages/Chat/lib/models/log';
import Debug from 'debug';
const debug = Debug('trpg:component:group:model:group');

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
  rule: string;

  members_count?: number;

  setOwner?: BelongsToSetAssociationMixin<PlayerUser, number>;
  addMember?: BelongsToManyAddAssociationMixin<PlayerUser, number>;
  getMembers?: BelongsToManyGetAssociationsMixin<PlayerUser>;
  hasMember?: BelongsToManyHasAssociationMixin<PlayerUser, number>;
  hasMembers?: BelongsToManyHasAssociationsMixin<PlayerUser, number>;
  removeMember?: BelongsToManyRemoveAssociationMixin<PlayerUser, number>;
  countMembers?: BelongsToManyCountAssociationsMixin;

  static EDITABLE_FIELDS = ['avatar', 'name', 'sub_name', 'desc', 'rule'];

  /**
   * 根据UUID查找团
   * TODO: 增加缓存以及缓存失效的操作
   * @param groupUUID 团UUID
   */
  static async findByUUID(groupUUID: string): Promise<GroupGroup> {
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
  static async findGroupActorsByUUID(groupUUID: string): Promise<GroupActor[]> {
    const group: GroupGroup = await GroupGroup.findOne({
      where: {
        uuid: groupUUID,
      },
      include: [
        {
          model: GroupActor,
          as: 'groupActors',
          include: [
            {
              model: PlayerUser,
              as: 'owner',
            },
          ],
        },
      ],
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
   * 更新团信息
   * @param groupUUID 团UUID
   * @param groupInfo 团信息
   * @param playerUUID 操作用户UUID
   */
  static async updateInfo(
    groupUUID: string,
    groupInfo: { [key: string]: any },
    playerUUID: string
  ) {
    const group = await GroupGroup.findByUUID(groupUUID);
    if (!group) {
      throw '找不到团';
    }
    if (!group.isManagerOrOwner(playerUUID)) {
      throw '没有修改权限';
    }

    // IDEA: 为防止意外暂时只允许修改 EDITABLE_FIELDS 指定的字段
    for (const field of GroupGroup.EDITABLE_FIELDS) {
      if (!_.isNil(groupInfo[field])) {
        group[field] = groupInfo[field];
      }
    }

    await group.save();

    return group;
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

      // 通知团其他所有人更新团成员列表
      app.player.manager.roomcastSocketEvent(
        group.uuid,
        'group::addGroupMember',
        {
          groupUUID: group.uuid,
          memberUUID: user.uuid,
        }
      );
    }
  }

  /**
   * 移除团成员
   * @param groupUUID 团UUID
   * @param userUUID 要移除的用户的UUID
   * @param operatorUserUUID 操作者的UUID, 如果有输入则进行权限校验
   * @returns 返回移除成员团的UUID与移除用户的UUID
   */
  static async removeGroupMember(
    groupUUID: string,
    userUUID: string,
    operatorUserUUID?: string
  ): Promise<{
    user: PlayerUser;
    group: GroupGroup;
  }> {
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

    if (_.isString(operatorUserUUID)) {
      // 有操作人, 进行权限校验
      if (!group.isManagerOrOwner(operatorUserUUID)) {
        // 操作人不是管理
        throw '您没有该权限';
      } else if (
        group.isManagerOrOwner(userUUID) &&
        group.owner_uuid !== operatorUserUUID
      ) {
        // 被踢人是管理但操作人不是团所有人
        throw '您没有该权限';
      }
    }

    if (!(await group.hasMember(user))) {
      throw '该团没有该成员';
    }

    await group.removeMember(user);

    // 离开房间
    const app = GroupGroup.getApplication();
    await app.player.manager.leaveRoomWithUUID(group.uuid, userUUID);

    // 通知团其他所有人更新团成员列表
    app.player.manager.roomcastSocketEvent(
      group.uuid,
      'group::removeGroupMember',
      {
        groupUUID: group.uuid,
        memberUUID: user.uuid,
      }
    );

    // 返回操作对象用于后续操作。如通知
    return {
      user,
      group,
    };
  }

  /**
   * 发送加入成员的系统通知
   */
  async sendAddMemberNotify(memberUUID: string) {
    const user = await PlayerUser.findByUUID(memberUUID);
    const name = user.getName();
    const groupUUID = this.uuid; // 团UUID

    // 发送团所有人都可见的简单系统消息
    await ChatLog.sendSimpleSystemMsg(null, groupUUID, `${name} 加入本团`);
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

  /**
   * 获取当前团人数
   */
  getMembersCount(): Promise<number> {
    return this.countMembers();
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
      members_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: '一个反范式操作，用于方便的获取用户数',
      },
      rule: {
        type: Sequelize.TEXT,
        defaultValue: '',
      },
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

  // 更新团的成员数
  const updateGroupMembersCountHook = async (groupId: number) => {
    const group: GroupGroup = await GroupGroup.findByPk(groupId);
    group.members_count = await group.getMembersCount();
    await group.save();
    debug(
      'update group[%s] members count -> %d',
      group.uuid,
      group.members_count
    );
  };
  // 定义group members的中间模型
  const GroupMembers = db.define(
    'group_group_members',
    {
      selected_group_actor_uuid: { type: Sequelize.STRING },
    },
    {
      hooks: {
        afterBulkCreate: async (ins) => {
          await Promise.all(
            _.map(ins, 'groupGroupId').map((id: number) =>
              updateGroupMembersCountHook(id)
            )
          );
        },
        afterBulkDestroy: async (options) => {
          const groupId = options.where['groupGroupId'];
          if (_.isNumber(groupId)) {
            await updateGroupMembersCountHook(groupId);
          }
        },
      },
    }
  );
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
