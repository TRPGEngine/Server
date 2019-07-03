import { Model, Orm, DBInstance, Op } from 'trpg/core';

export class Actor extends Model {
  uuid: string;
  name: string;
  desc: string;
  avatar: string;
  template_uuid: string;
  info: string;

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
  Actor.init(
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      name: { type: Sequelize.STRING, required: true },
      desc: { type: Sequelize.STRING },
      avatar: { type: Sequelize.STRING },
      template_uuid: { type: Sequelize.STRING, required: true },
      info: { type: Sequelize.JSON },
    },
    { tableName: 'actor_actor', sequelize: db, paranoid: true }
  );

  const User = db.models.player_user as any;
  if (!!User) {
    // Actor.hasOne('owner', User, {reverse: 'actors'});
    Actor.belongsTo(User, {
      foreignKey: 'ownerId',
      as: 'owner',
    });
    User.hasMany(Actor, {
      foreignKey: 'ownerId',
      as: 'actors',
    });
  }

  return Actor;
}
