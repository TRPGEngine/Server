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
  BelongsToManyAddAssociationsMixin,
} from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';
import { GroupActor } from './actor';
import _ from 'lodash';
import { ChatLog } from 'packages/Chat/lib/models/log';
import {
  notifyUpdateGroupInfo,
  notifyGroupRemoveMember,
  notifyGroupAddMember,
  notifyUserAddGroup,
} from '../notify';
import { GroupDetail } from './detail';
import { GroupChannel } from './channel';
import Debug from 'debug';
import { GroupPanel } from './panel';
import { NoPermissionError, NoReportError, NotFoundError } from 'lib/error';

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
  detail?: GroupDetail;
  channels?: GroupChannel[];
  panels?: GroupPanel[];

  setOwner?: BelongsToSetAssociationMixin<PlayerUser, number>;
  addMember?: BelongsToManyAddAssociationMixin<PlayerUser, number>;
  addMembers?: BelongsToManyAddAssociationsMixin<PlayerUser, number>;
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
   * 获取团完整信息(加入后)
   * 包括详情, 频道, 面板
   */
  static async getGroupFullData(uuid: string): Promise<GroupGroup> {
    const group = await GroupGroup.findOne({
      where: {
        uuid,
      },
      include: [
        {
          model: GroupDetail,
          as: 'detail',
        },
        {
          model: GroupChannel,
          as: 'channels',
        },
        {
          model: GroupPanel,
          as: 'panels',
          separate: true,
          order: [['order', GroupPanel.defaultOrder]],
        },
      ],
    });

    return group;
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
          model: GroupActor.scope(),
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
   * 创建一个团
   * @param name 团名
   * @param avatar 团头像
   * @param subName 团副名
   * @param desc 团简介
   * @param userUUID 操作人UUID
   */
  static async createGroup(
    name: string,
    avatar: string,
    subName: string,
    desc: string,
    userUUID: string
  ): Promise<GroupGroup> {
    if (!name) {
      throw new NoReportError('缺少团名');
    }

    const isExist = await GroupGroup.findOne({
      where: { name },
    });
    if (!!isExist) {
      throw new NoReportError('该团名已存在');
    }

    const user = await PlayerUser.findByUUID(userUUID);
    const group: GroupGroup = await GroupGroup.create({
      type: 'group',
      name,
      sub_name: subName,
      desc,
      avatar,
      creator_uuid: userUUID,
      owner_uuid: userUUID,
      managers_uuid: [],
      maps_uuid: [],
    });

    await group.setOwner(user);
    await GroupGroup.addGroupMember(group.uuid, userUUID);

    const trpgapp = GroupGroup.getApplication();
    await trpgapp.player.manager.joinRoomWithUUID(group.uuid, userUUID);

    return group;
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
      throw new Error('找不到团');
    }
    if (!group.isManagerOrOwner(playerUUID)) {
      throw new Error('没有修改权限');
    }

    // IDEA: 为防止意外, 暂时只允许修改 EDITABLE_FIELDS 指定的字段
    for (const field of GroupGroup.EDITABLE_FIELDS) {
      if (!_.isNil(groupInfo[field])) {
        group[field] = groupInfo[field];
      }
    }

    await group.save();

    notifyUpdateGroupInfo(group.uuid, group);

    return group;
  }

  /**
   * 获取用户所加入的所有团的列表
   * 返回的信息包含团detail信息
   * @param userUUID 用户UUID
   */
  static async getAllUserGroupList(userUUID: string): Promise<GroupGroup[]> {
    if (_.isNil(userUUID)) {
      throw new Error('缺少必要字段');
    }

    const user = await PlayerUser.findByUUID(userUUID);
    const groups = await user.getGroups({
      include: [
        {
          model: GroupDetail,
          as: 'detail',
        },
        {
          model: GroupChannel,
          as: 'channels',
        },
        {
          model: GroupPanel,
          as: 'panels',
          separate: true,
          order: [['order', GroupPanel.defaultOrder]],
        },
      ],
    });
    return groups;
  }

  /**
   * 获取一定时间范围内所有的团聊天记录
   */
  static async getGroupRangeChatLog(
    groupUUID: string,
    converseUUID: string,
    playerUUID: string,
    from: string,
    to: string
  ): Promise<ChatLog[]> {
    const user = await PlayerUser.findByUUID(playerUUID);
    if (_.isNil(user)) {
      throw new NotFoundError('用户不存在');
    }

    const group = await GroupGroup.findByUUID(groupUUID);
    if (_.isNil(user)) {
      throw new NotFoundError('团不存在');
    }

    if (!(await group.hasMember(user))) {
      throw new NoPermissionError('不是团成员无法获取团日志');
    }

    return ChatLog.findRangeConverseLog(converseUUID ?? groupUUID, from, to);
  }

  /**
   * 倒序获取团聊天记录
   * @param groupUUID
   * @param playerUUID
   * @param page
   * @param size
   */
  static async getGroupChatLog(
    groupUUID: string,
    playerUUID: string,
    page = 1,
    size = 10
  ): Promise<{ logs: ChatLog[]; count: number }> {
    const user = await PlayerUser.findByUUID(playerUUID);
    if (_.isNil(user)) {
      throw new Error('用户不存在');
    }

    const group = await GroupGroup.findByUUID(groupUUID);
    if (_.isNil(user)) {
      throw new Error('团不存在');
    }

    if (!(await group.hasMember(user))) {
      throw new Error('不是团成员');
    }

    const {
      rows,
      count,
    }: { rows: ChatLog[]; count: number } = await ChatLog.findAndCountAll({
      where: {
        converse_uuid: groupUUID,
        revoke: false, // 获取范围聊天记录时不返回撤回的消息
      },
      offset: (page - 1) * size,
      limit: size,
      order: [['id', 'DESC']],
    });

    return { logs: rows.reverse(), count };
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
      throw new Error('用户不存在');
    }

    const exist = await group.hasMembers([user]);
    if (exist) {
      throw new NoReportError('用户已经在团中');
    }

    await group.addMember(user);

    const app = GroupGroup.getApplication();

    if (app.player) {
      if (await app.player.manager.checkPlayerOnline(user.uuid)) {
        // 检查加入团的成员是否在线, 如果在线则发送一条更新通知要求其更新团信息
        const groupFullData = await GroupGroup.getGroupFullData(group.uuid);
        notifyUserAddGroup(user.uuid, groupFullData);
        app.player.manager.joinRoomWithUUID(group.uuid, user.uuid);
      }
    }

    // 通知团其他所有人更新团成员列表
    notifyGroupAddMember(group.uuid, user.uuid);

    // 发送系统消息
    group.sendAddMemberNotify(userUUID);
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
      throw new Error('找不到团');
    }

    if (group.owner_uuid === userUUID) {
      throw new Error('作为团主持人你无法直接退出群');
    }

    const user = await PlayerUser.findByUUID(userUUID);
    if (_.isNil(user)) {
      throw new Error('找不到用户');
    }

    if (_.isString(operatorUserUUID)) {
      // 有操作人, 进行权限校验
      if (!group.isManagerOrOwner(operatorUserUUID)) {
        // 操作人不是管理
        throw new Error('您没有该权限');
      } else if (
        group.isManagerOrOwner(userUUID) &&
        group.owner_uuid !== operatorUserUUID
      ) {
        // 被踢人是管理但操作人不是团所有人
        throw new Error('您没有该权限');
      }
    }

    if (!(await group.hasMember(user))) {
      throw new Error('该团没有该成员');
    }

    if (group.managers_uuid.includes(user.uuid)) {
      // 如果管理员列表中有该用户，则删除
      group.managers_uuid = _.without(group.managers_uuid, user.uuid);
      notifyUpdateGroupInfo(group.uuid, {
        managers_uuid: group.managers_uuid,
      });
      await group.save();
    }
    await group.removeMember(user);

    // 离开房间
    const app = GroupGroup.getApplication();
    await app.player.manager.leaveRoomWithUUID(group.uuid, userUUID);

    // 通知团其他所有人更新团成员列表
    notifyGroupRemoveMember(group.uuid, user.uuid);

    // 返回操作对象用于后续操作。如通知
    return {
      user,
      group,
    };
  }

  /**
   * 获取团成员当前选择的团人物卡UUID
   * @param groupUUID 团UUID
   * @param playerUUID 要查找的用户的UUID
   */
  static async getMemberCurrentGroupActorUUID(
    groupUUID: string,
    playerUUID: string
  ): Promise<string | null> {
    const group = await GroupGroup.findByUUID(groupUUID);
    const member = await group.getMemberByUUID(playerUUID);

    const selectedGroupActorUUID = _.get(member, [
      'group_group_members',
      'selected_group_actor_uuid',
    ]);

    return selectedGroupActorUUID;
  }

  /**
   * 将某个团成员提升为管理员
   * @param groupUUID 团UUID
   * @param memberUUID 成员UUID
   * @param operatorUserUUID 操作人员UUID
   */
  static async setMemberToManager(
    groupUUID: string,
    memberUUID: string,
    operatorUserUUID: string
  ): Promise<GroupGroup> {
    if (operatorUserUUID === memberUUID) {
      throw new Error('你不能将自己提升为管理员');
    }
    const group = await GroupGroup.findByUUID(groupUUID);
    if (!group) {
      throw new Error('找不到团');
    }
    const member = await PlayerUser.findByUUID(memberUUID);
    if (!member) {
      throw new Error('找不到该成员');
    }
    if (group.owner_uuid !== operatorUserUUID) {
      // 操作人不是管理
      throw new Error('您不是团的所有者');
    }
    if (group.managers_uuid.indexOf(memberUUID) >= 0) {
      // 成员已经是管理员
      throw new Error('该成员已经是团管理员');
    }
    if (!(await group.hasMember(member))) {
      throw new Error('该团没有该成员');
    }

    group.managers_uuid = [...group.managers_uuid, memberUUID];
    const res = await group.save();

    // 发通知
    ChatLog.sendSimpleSystemMsg(
      memberUUID,
      null,
      `您已成为团 [${group.name}] 的管理员`
    );
    group.getManagerUUIDs().forEach((uuid) => {
      ChatLog.sendSimpleSystemMsg(
        uuid,
        null,
        `团成员 ${member.getName()} 已被提升为团 [${group.name}] 的管理员`
      );
    });

    // 通知更新管理员列表
    notifyUpdateGroupInfo(group.uuid, {
      managers_uuid: group.managers_uuid,
    });

    return res;
  }

  /**
   * 将某个团管理员降级为成员
   * @param groupUUID 团UUID
   * @param memberUUID 成员UUID
   * @param operatorUserUUID 操作人员UUID
   */
  static async setManagerToMember(
    groupUUID: string,
    memberUUID: string,
    operatorUserUUID: string
  ): Promise<GroupGroup> {
    if (operatorUserUUID === memberUUID) {
      throw new Error('你不能将自己变为普通成员');
    }
    const group = await GroupGroup.findByUUID(groupUUID);
    if (!group) {
      throw new Error('找不到团');
    }
    const member = await PlayerUser.findByUUID(memberUUID);
    if (!member) {
      throw new Error('找不到该成员');
    }
    if (group.owner_uuid !== operatorUserUUID) {
      // 操作人不是管理
      throw new Error('您不是团的所有者');
    }
    if (group.managers_uuid.indexOf(memberUUID) === 0) {
      // 成员已经是普通用户
      throw new Error('该成员不是管理员');
    }
    if (!(await group.hasMember(member))) {
      throw new Error('该团没有该成员');
    }

    const managerUUIDs = new Set(group.managers_uuid);
    managerUUIDs.delete(memberUUID);
    group.managers_uuid = Array.from(managerUUIDs);
    const res: GroupGroup = await group.save();

    // 发通知
    ChatLog.sendSimpleSystemMsg(
      memberUUID,
      null,
      `您已不再是团 [${group.name}] 的管理员`
    );
    group.getManagerUUIDs().forEach((uuid) => {
      ChatLog.sendSimpleSystemMsg(
        uuid,
        null,
        `团成员 ${member.getName()} 已不再是团 [${group.name}] 的管理员`
      );
    });

    // 通知更新管理员列表
    notifyUpdateGroupInfo(group.uuid, {
      managers_uuid: group.managers_uuid,
    });

    return res;
  }

  /**
   * 将团成员踢出
   * @param groupUUID 团UUID
   * @param memberUUID 成员UUID
   * @param operatorUserUUID 操作人员UUID - 必须是管理员
   */
  static async tickMember(
    groupUUID: string,
    memberUUID: string,
    operatorUserUUID?: string
  ) {
    if (operatorUserUUID === memberUUID) {
      throw new Error('您不能踢出你自己');
    }

    const { group, user } = await GroupGroup.removeGroupMember(
      groupUUID,
      memberUUID,
      operatorUserUUID
    );

    // 发通知
    ChatLog.sendSimpleSystemMsg(
      user.uuid,
      null,
      `您已被踢出团 [${group.name}]`
    );
    group.getManagerUUIDs().forEach((uuid) => {
      ChatLog.sendSimpleSystemMsg(
        uuid,
        null,
        `团成员 ${user.getName()} 已被踢出团 [${group.name}]`
      );
    });
  }

  /**
   * 发送加入成员的团系统通知
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
   * TODO: selected_actor_uuid 相关可能会有问题。需要处理
   * 获取团成员列表
   */
  async getAllGroupMember(): Promise<any[]> {
    let members = await this.getMembers();
    members = members.map((i) => ({
      ...i.getInfo(),
      selected_actor_uuid: i.group_group_members.selected_group_actor_uuid,
    }));

    return members;
  }

  /**
   * 获取所有团的UUID
   */
  async getAllGroupUUIDs(): Promise<string[]> {
    const members: PlayerUser[] = await this.getMembers();
    const memberUUIDs = members.map((i) => i.uuid);

    return memberUUIDs;
  }

  /**
   * 获取团所有团角色的设置mapping
   * @param selfUUID 用户自己的UUID
   */
  async getGroupActorMapping(
    selfUUID: string
  ): Promise<{
    [userUUID: string]: string;
  }> {
    const members = await this.getMembers();
    const mapping = _.fromPairs<string>(
      members.map((member) => {
        const userUUID = _.get(member, 'uuid');
        const groupActorUUID = _.get(
          member,
          'group_group_members.selected_group_actor_uuid'
        );

        if (_.isNil(groupActorUUID)) {
          return [];
        }

        return [userUUID, groupActorUUID];
      })
    );

    // TODO: 这个self不知道有没有用，应当在前端指定而不是后端
    if (mapping[selfUUID]) {
      mapping['self'] = mapping[selfUUID];
    }

    return mapping;
  }

  /**
   * 获取在某个团中的用户信息
   * 返回的信息中会包含关联模型关联信息
   * @param playerUUID 用户UUID
   */
  async getMemberByUUID(playerUUID: string): Promise<PlayerUser | null> {
    return _.first(
      await this.getMembers({
        where: {
          uuid: playerUUID,
        },
        limit: 1,
      })
    );
  }

  /**
   * 检查用户是否在团里
   * @param memberUUID 成员UUID
   */
  async isMember(memberUUID: string): Promise<boolean> {
    const member = await this.getMemberByUUID(memberUUID);

    return !_.isNil(member);
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
