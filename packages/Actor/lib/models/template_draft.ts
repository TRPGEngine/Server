import { Model, Orm, DBInstance } from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';
import _ from 'lodash';

export class ActorTemplateDraft extends Model {
  id: number;
  uuid: string;
  name: string;
  desc: string;
  avatar: string;
  published: boolean; // 是否发布

  layout: string; // xml布局
  ast: object; // ast布局, 用于布局编辑器的原始数据存储
}

export default function ActorTemplateDraftDefinition(
  Sequelize: Orm,
  db: DBInstance
) {
  ActorTemplateDraft.init(
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      name: { type: Sequelize.STRING, required: true },
      desc: { type: Sequelize.STRING },
      avatar: { type: Sequelize.STRING },
      published: { type: Sequelize.BOOLEAN },
      layout: { type: Sequelize.TEXT({ length: 'medium' }) }, // 模板布局
      ast: { type: Sequelize.JSON },
    },
    { tableName: 'actor_template_draft', sequelize: db, paranoid: true }
  );

  ActorTemplateDraft.belongsTo(PlayerUser, {
    foreignKey: 'creatorId',
    as: 'creator',
  });
  PlayerUser.hasMany(ActorTemplateDraft, {
    foreignKey: 'creatorId',
    as: 'actorTemplateDrafts',
  });

  return ActorTemplateDraft;
}
