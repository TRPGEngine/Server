import {
  Orm,
  DBInstance,
  Model,
  BelongsToGetAssociationMixin,
} from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';
import { ActorActor } from 'packages/Actor/lib/models/actor';
import { GroupGroup } from './group';
import _ from 'lodash';

export class GroupActor extends Model {
  id: number;
  uuid: string;
  actor_uuid: string;
  actor_info: {};
  name: string;
  desc: string;
  avatar: string;
  passed: boolean;
  enabled: boolean;
  createAt: string;
  updateAt: string;

  getActor?: BelongsToGetAssociationMixin<ActorActor>;
  getOwner?: BelongsToGetAssociationMixin<PlayerUser>;
  getGroup?: BelongsToGetAssociationMixin<GroupGroup>;

  /**
   * 添加一个待审核的团人物
   */
  static async addApprovalGroupActor(
    groupUUID: string,
    actorUUID: string,
    playerUUID: string
  ): Promise<GroupActor> {
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
      throw new Error('该角色已存在');
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

    _.set(groupActor, 'dataValues.actor', actor);
    _.set(groupActor, 'dataValues.group', group);

    return groupActor;
  }

  async getObjectAsync() {
    const actor = await this.getActor();

    return {
      uuid: this.uuid,
      name: this.name,
      desc: this.desc,
      actor_uuid: this.actor_uuid,
      actor_info: this.actor_info,
      avatar: this.avatar,
      passed: this.passed,
      enabled: this.enabled,
      createAt: this.createAt,
      updateAt: this.updateAt,
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
      name: { type: Sequelize.STRING },
      desc: { type: Sequelize.TEXT },
      avatar: { type: Sequelize.STRING },
      passed: { type: Sequelize.BOOLEAN, defaultValue: false },
      enabled: { type: Sequelize.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'group_actor',
      sequelize: db,
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
