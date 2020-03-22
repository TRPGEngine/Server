import {
  Orm,
  DBInstance,
  Model,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  ModelAccess,
  HasManyGetAssociationsMixin,
} from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';
import { ActorActor } from 'packages/Actor/lib/models/actor';
import { GroupGroup } from './group';
import _ from 'lodash';
import { ChatLog } from 'packages/Chat/lib/models/log';
import {
  notifyUpdateGroupActorInfo,
  notifyUpdateGroupActor,
  notifyAddGroupActor,
} from '../notify';
import { GroupChannel } from './channel';
import Debug from 'debug';
const debug = Debug('trpg:component:group:model:actor');

declare module './group' {
  interface GroupGroup {
    getGroupActors?: HasManyGetAssociationsMixin<GroupActor>;
  }
}

export class GroupActor extends Model {
  id: number;
  uuid: string;
  actor_uuid: string;
  actor_info: {};
  actor_template_uuid: string;
  name: string;
  desc: string;
  avatar: string;
  passed: boolean;
  enabled: boolean;
  createAt: string;
  updateAt: string;

  owner?: PlayerUser;
  ownerId?: number;
  actor?: ActorActor;
  getActor?: BelongsToGetAssociationMixin<ActorActor>;
  getOwner?: BelongsToGetAssociationMixin<PlayerUser>;
  setOwner?: BelongsToSetAssociationMixin<PlayerUser, number>;
  getGroup?: BelongsToGetAssociationMixin<GroupGroup>;
  setActor?: BelongsToSetAssociationMixin<ActorActor, number>;

  static async getAccess(
    groupUUID: string,
    groupActorUUID: string,
    playerUUID: string
  ): Promise<ModelAccess> {
    const group = await GroupGroup.findByUUID(groupUUID);

    const isManager = group.isManagerOrOwner(playerUUID);
    if (isManager) {
      return {
        editable: true,
        removeable: group.isOwner(playerUUID),
      };
    } else {
      return {
        editable: false,
        removeable: false,
      };
    }
  }

  /**
   * 编辑团成员信息
   * @param playerUUID 操作人UUID
   */
  static async editActorInfo(
    groupActorUUID: string,
    groupActorInfo: {},
    playerUUID: string
  ) {
    const groupActor: GroupActor = await GroupActor.findOne({
      where: {
        uuid: groupActorUUID,
      },
    });

    if (_.isNil(groupActor)) {
      throw new Error('该角色不存在');
    }

    const group: GroupGroup = await groupActor.getGroup();

    const allowEdit = group.isManagerOrOwner(playerUUID);
    if (!allowEdit) {
      throw new Error('没有编辑权限');
    }

    const name = _.get(groupActorInfo, '_name');
    const desc = _.get(groupActorInfo, '_desc');
    const avatar = _.get(groupActorInfo, '_avatar');

    if (_.isString(name) && name !== '') {
      groupActor.name = name;
    }
    if (_.isString(desc)) {
      groupActor.desc = desc;
    }
    if (_.isString(avatar)) {
      groupActor.avatar = avatar;
    }
    if (!_.isEmpty(groupActorInfo)) {
      groupActor.actor_info = _.merge(
        _.cloneDeep(groupActor.actor_info),
        groupActorInfo
      );
    }

    await groupActor.save();

    // 通知房间所有用户更新团人物信息
    notifyUpdateGroupActorInfo(group.uuid, groupActor);

    // 异步发送团消息更新角色信息
    (async () => {
      const user = await PlayerUser.findByUUID(playerUUID);
      const operationName = user.getName();
      ChatLog.sendConverseSystemMsg(
        group.uuid,
        `${operationName} 更新了人物卡 ${groupActor.name} 的信息`
      );
    })();

    return groupActor;
  }

  /**
   * 移除团角色
   * @param groupActorUUID 团人物UUID
   * @param playerUUID 操作人员的UUID
   */
  static async remove(
    groupActorUUID: string,
    playerUUID: string
  ): Promise<void> {
    const groupActor: GroupActor = await GroupActor.findOne({
      where: {
        uuid: groupActorUUID,
      },
    });

    if (_.isNil(groupActor)) {
      throw new Error('该团人物不存在');
    }

    const group: GroupGroup = await groupActor.getGroup();
    if (_.isNil(group)) {
      throw new Error('找不到相关联的团');
    }

    if (!group.isManagerOrOwner(playerUUID)) {
      throw new Error('没有操作权限');
    }

    await groupActor.destroy();
  }

  /**
   * 获取团人物详情
   * @param uuid 团人物UUID
   */
  static async getDetailByUUID(uuid: string): Promise<GroupActor> {
    const groupActor = await GroupActor.findOne({
      where: {
        uuid,
      },
      attributes: [
        'uuid',
        'actor_uuid',
        'actor_info',
        'actor_template_uuid',
        'name',
        'desc',
        'avatar',
        'passed',
        'enabled',
        'updatedAt',
      ],
    });

    return groupActor;
  }

  /**
   * 获取团所有的团角色
   * 带上相对的用户信息
   * @param groupUUID 团UUID
   */
  static async getAllGroupActors(groupUUID: string): Promise<GroupActor[]> {
    const group = await GroupGroup.findByUUID(groupUUID);
    if (_.isNil(group)) {
      throw new Error('找不到团信息');
    }

    const groupActors = await group.getGroupActors();

    return groupActors;
  }

  /**
   * 添加一个待审核的团人物
   * TODO: 需要增加一个用户是否在该团内的判断
   * @returns 返回带actor数据的GroupActor数据对象
   */
  static async addApprovalGroupActor(
    groupUUID: string,
    actorUUID: string,
    playerUUID: string
  ): Promise<object> {
    if (!groupUUID || !actorUUID) {
      throw new Error('缺少必要参数');
    }

    const group = await GroupGroup.findByUUID(groupUUID);
    if (!group) {
      throw new Error('找不到团');
    }

    const actor = await ActorActor.findByUUID(actorUUID);
    if (!actor) {
      throw new Error('找不到该角色');
    }

    const isGroupActorExist = await GroupActor.findOne({
      where: { actor_uuid: actor.uuid, groupId: group.id },
    });
    if (!_.isNil(isGroupActorExist)) {
      throw new Error('该角色已存在, 请勿重复申请');
    }

    const user = await PlayerUser.findByUUID(playerUUID);
    const groupActor = await GroupActor.create({
      name: actor.name,
      desc: actor.desc,
      actor_uuid: actorUUID,
      actor_info: {},
      avatar: actor.avatar,
      passed: false,
      ownerId: user.id,
      actorId: actor.id,
      groupId: group.id,
    });

    const groupActorData = groupActor.toJSON();
    groupActorData.actor = actor.toJSON();

    // 通知用户增加
    notifyAddGroupActor(group.uuid, groupActorData);

    return groupActorData;
  }

  /**
   * 同意团人物卡的审批
   * 并将Actor的数据写入的GroupActor中
   * @param groupActorUUID 团角色UUID
   * @param playerUUID 操作人UUID
   */
  static async agreeApprovalGroupActor(
    groupActorUUID: string,
    playerUUID: string
  ): Promise<GroupActor> {
    if (!_.isString(groupActorUUID) || !_.isString(playerUUID)) {
      throw new Error('缺少必要参数');
    }

    const groupActor: GroupActor = await GroupActor.findOne({
      where: {
        uuid: groupActorUUID,
      },
    });

    if (_.isNil(groupActor)) {
      throw new Error('找不到该团人物');
    }

    const group: GroupGroup = await groupActor.getGroup();

    if (_.isNil(group)) {
      throw new Error('找不到该人物所在团');
    }

    if (!group.isManagerOrOwner(playerUUID)) {
      throw new Error('没有操作权限');
    }

    groupActor.passed = true;
    const actor: ActorActor = await groupActor.getActor();
    if (!_.isNil(actor)) {
      groupActor.actor_info = actor.info;
      groupActor.actor_template_uuid = actor.template_uuid;
    }
    await groupActor.save();

    // 通知房间所有用户更新团人物信息
    notifyUpdateGroupActor(group.uuid, groupActor);

    return groupActor;
  }

  /**
   * 拒绝团角色
   * 本质上是删除团角色
   * @param groupActorUUID 团角色UUID
   * @param playerUUID 操作人UUID
   */
  static async refuseApprovalGroupActor(
    groupActorUUID: string,
    playerUUID: string
  ): Promise<void> {
    if (!_.isString(groupActorUUID) || !_.isString(playerUUID)) {
      throw new Error('缺少必要参数');
    }

    const groupActor: GroupActor = await GroupActor.findOne({
      where: {
        uuid: groupActorUUID,
        passed: false,
      },
    });
    if (_.isNil(groupActor)) {
      throw new Error('找不到该团人物或该人物已通过审批');
    }
    const group: GroupGroup = await groupActor.getGroup();
    if (_.isNil(group)) {
      throw new Error('找不到该人物所在团');
    }
    if (!group.isManagerOrOwner(playerUUID)) {
      throw new Error('没有操作权限');
    }

    await groupActor.destroy();
  }

  /**
   * 分配团角色到团
   * @param groupUUID 团UUID
   * @param groupActorUUID 团角色UUID
   * @param playerUUID 操作人UUID
   * @param targetUUID 分配到角色的用户的UUID
   */
  static async assignGroupActor(
    groupUUID: string,
    groupActorUUID: string,
    playerUUID: string,
    targetUUID: string
  ): Promise<GroupActor> {
    const group = await GroupGroup.findByUUID(groupUUID);
    if (_.isNil(group)) {
      throw new Error('该团不存在');
    }

    if (!group.isManagerOrOwner(playerUUID)) {
      throw new Error('该操作没有权限');
    }

    const user = await PlayerUser.findByUUID(playerUUID);
    if (_.isNil(user)) {
      throw new Error('操作人不存在');
    }

    const groupActor: GroupActor = await GroupActor.findOne({
      where: { uuid: groupActorUUID, groupId: group.id },
      include: [
        {
          model: PlayerUser,
          as: 'owner',
        },
      ],
    });

    if (_.isNil(groupActor)) {
      throw new Error('该团角色不存在');
    }

    if (!groupActor.enabled) {
      throw new Error('该角色不可用');
    }

    if (!groupActor.passed) {
      throw new Error('该角色尚不是正式角色');
    }

    const target = await PlayerUser.findByUUID(targetUUID);
    if (_.isNil(target)) {
      throw new Error('目标用户不存在');
    }

    await groupActor.setOwner(target);

    // notify
    ChatLog.sendSimpleSystemMsg(
      target.uuid,
      null,
      `您被分配角色卡${group.name} - ${groupActor.name}`
    );

    if (!_.isNil(groupActor.owner)) {
      // 如果有原拥有者的话
      ChatLog.sendSimpleSystemMsg(
        groupActor.owner.uuid,
        null,
        `您的角色卡${
          groupActor.name
        }已经被${user.getName()}分配给了${target.getName()}`
      );
    }

    return groupActor;
  }

  /**
   * 获取当前选择的团角色的UUID
   */
  static async getSelectedGroupActorUUID(
    group: GroupGroup,
    userUUID: string
  ): Promise<string> {
    const members: PlayerUser[] = await group.getMembers({
      where: {
        uuid: userUUID,
      },
    });

    const member = _.first(members);
    if (_.isNil(member)) {
      throw new Error('没有找到匹配的团队成员');
    }

    const selectedGroupActorUUID = _.get(member, [
      'group_group_members',
      'selected_group_actor_uuid',
    ]);

    return selectedGroupActorUUID;
  }

  /**
   * 根据会话UUID获取团信息
   * TODO: 这是一个非常耗资源的操作。看看能不能优化
   * @param converseUUID 会话UUID
   */
  static async getGroupActorDataFromConverse(
    converseUUID: string,
    playerUUID: string
  ): Promise<{}> {
    if (_.isEmpty(converseUUID)) {
      debug('[getGroupActorDataFromConverse] converseUUID is empty');
      return {};
    }

    let group = await GroupGroup.findByUUID(converseUUID);
    if (_.isNil(group)) {
      // 尝试在查看是不是channel uuid
      const channel = await GroupChannel.findByUUID(converseUUID);

      if (_.isNil(channel)) {
        // 如果也不是channel则直接返回
        debug('[getGroupActorDataFromConverse] not match any group or channel');
        return {};
      }

      group = channel.getGroup();
    }

    let selectedGroupActorUUID: string;
    try {
      selectedGroupActorUUID = await GroupActor.getSelectedGroupActorUUID(
        group,
        playerUUID
      );
    } catch (e) {
      debug('[getGroupActorDataFromConverse]', e);
      return {};
    }
    if (_.isEmpty(selectedGroupActorUUID)) {
      debug('[getGroupActorDataFromConverse] selectedGroupActorUUID is empty');
      return {};
    }

    const groupActor = await GroupActor.findOne({
      where: {
        uuid: selectedGroupActorUUID,
      },
      attributes: ['actor_info'],
    });

    if (_.isNil(groupActor)) {
      debug('[getGroupActorDataFromConverse] cannot find groupactor');
      return {};
    }

    return groupActor.actor_info ?? {};
  }

  async getObjectAsync() {
    const actor = await this.getActor();

    return {
      ...this.toJSON(),
      actor: actor,
    };
  }
}

export default function GroupActorDefinition(Sequelize: Orm, db: DBInstance) {
  GroupActor.init(
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      actor_uuid: { type: Sequelize.UUID }, // 对应actor_actor的UUID
      actor_info: { type: Sequelize.JSON }, // 团人物信息
      actor_template_uuid: { type: Sequelize.UUID }, // 团人物模板的UUID
      name: { type: Sequelize.STRING },
      desc: { type: Sequelize.TEXT },
      avatar: { type: Sequelize.STRING },
      passed: { type: Sequelize.BOOLEAN, defaultValue: false },
      enabled: { type: Sequelize.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'group_actor',
      sequelize: db,
      defaultScope: {
        // 默认获取要包含这些参数
        include: [
          {
            model: ActorActor,
            as: 'actor',
          },
          {
            model: PlayerUser,
            as: 'owner',
            attributes: ['uuid'],
          },
        ],
      },
    }
  );

  GroupActor.belongsTo(PlayerUser, {
    as: 'owner',
  });

  GroupActor.belongsTo(ActorActor, {
    as: 'actor',
  });

  GroupActor.belongsTo(GroupGroup, {
    foreignKey: 'groupId',
    as: 'group',
  });
  GroupGroup.hasMany(GroupActor, {
    foreignKey: 'groupId',
    as: 'groupActors',
  });

  return GroupActor;
}
