import {
  Orm,
  DBInstance,
  Model,
  BelongsToGetAssociationMixin,
} from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';
import { ActorActor } from 'packages/Actor/lib/models/actor';
import { GroupGroup } from './group';

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
