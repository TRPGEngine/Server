import {
  Model,
  Orm,
  DBInstance,
  BelongsToSetAssociationMixin,
} from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';

export class ActorActor extends Model {
  uuid: string;
  name: string;
  desc: string;
  avatar: string;
  template_uuid: string;
  info: {};

  setOwner?: BelongsToSetAssociationMixin<PlayerUser, number>;

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
