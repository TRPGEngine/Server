import {
  Orm,
  DBInstance,
  Model,
  BelongsToManyAddAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyHasAssociationsMixin,
  BelongsToSetAssociationMixin,
} from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';
import { GroupActor } from './actor';
import _ from 'lodash';

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
        // 检查是否加入团的成员在线, 如果在线则发送一条更新通知
        app.player.manager.unicastSocketEvent(
          user.uuid,
          'group::addGroupSuccess',
          { group }
        );
        app.player.manager.joinRoomWithUUID(group.uuid, user.uuid);
      }
    }
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
