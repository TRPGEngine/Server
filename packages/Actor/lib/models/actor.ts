import {
  Model,
  Orm,
  DBInstance,
  BelongsToSetAssociationMixin,
  BelongsToGetAssociationMixin,
} from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';
import _ from 'lodash';

export class ActorActor extends Model {
  id: number;
  uuid: string;
  name: string;
  desc: string;
  avatar: string;
  template_uuid: string;
  info: {};

  setOwner?: BelongsToSetAssociationMixin<PlayerUser, number>;
  getOwner?: BelongsToGetAssociationMixin<PlayerUser>;

  static findByUUID(uuid: string): Promise<ActorActor> {
    return ActorActor.findOne({
      where: {
        uuid,
      },
    });
  }

  /**
   * 删除人物卡
   * @param groupActorUUID 团人物UUID
   * @param playerUUID 操作人员的UUID
   */
  static async remove(actorUUID: string, playerUUID: string) {
    const actor = await ActorActor.findByUUID(actorUUID);

    if (_.isNil(actor)) {
      throw new Error('该人物卡不存在');
    }

    const owner: PlayerUser = await actor.getOwner();
    if (_.isNil(owner)) {
      throw new Error('该人物卡所有权不明');
    }

    if (owner.uuid !== playerUUID) {
      throw new Error('没有操作权限， 您不是该人物卡的所有者');
    }

    await actor.destroy();
  }

  getObject() {
    return {
      name: this.name,
      desc: this.desc,
      avatar: this.avatar,
      uuid: this.uuid,
      template_uuid: this.template_uuid,
      info: this.info,
    };
  }
}

export default function ActorDefinition(Sequelize: Orm, db: DBInstance) {
  ActorActor.init(
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      name: { type: Sequelize.STRING, required: true },
      desc: { type: Sequelize.TEXT },
      avatar: { type: Sequelize.STRING },
      template_uuid: { type: Sequelize.STRING, required: true },
      info: { type: Sequelize.JSON },
    },
    { tableName: 'actor_actor', sequelize: db, paranoid: true }
  );

  const User = db.models.player_user as any;
  if (!!User) {
    // ActorActor.hasOne('owner', User, {reverse: 'actors'});
    ActorActor.belongsTo(User, {
      foreignKey: 'ownerId',
      as: 'owner',
    });
    User.hasMany(ActorActor, {
      foreignKey: 'ownerId',
      as: 'actors',
    });
  }

  return ActorActor;
}
