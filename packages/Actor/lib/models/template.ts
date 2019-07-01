import { Model, Orm, DBInstance, Op } from 'trpg/core';

const at = require('trpg-actor-template');

export class ActorTemplate extends Model {
  uuid: string;
  name: string;
  desc: string;
  avatar: string;
  info: string;

  getObject() {
    let info = {};
    try {
      info = at.parse(this.info);
    } catch (err) {
      console.error(err);
    } finally {
      return info;
    }
  }

  static findTemplateAsync(nameFragment: string): Promise<ActorTemplate[]> {
    return ActorTemplate.findAll({
      where: {
        name: {
          [Op.like]: `%${nameFragment}%`,
        },
      },
      limit: 10,
    });
  }
}

export default function ActorTemplateDefinition(
  Sequelize: Orm,
  db: DBInstance
) {
  ActorTemplate.init(
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      name: { type: Sequelize.STRING, required: true },
      desc: { type: Sequelize.STRING },
      avatar: { type: Sequelize.STRING },
      info: { type: Sequelize.TEXT },
    },
    { tableName: 'actor_template', sequelize: db, paranoid: true }
  );

  let User = db.models.player_user as any;
  if (!!User) {
    ActorTemplate.belongsTo(User, {
      foreignKey: 'creatorId',
      as: 'creator',
    });
    User.hasMany(ActorTemplate, {
      foreignKey: 'creatorId',
      as: 'templates',
    });
  }

  return ActorTemplate;
}
