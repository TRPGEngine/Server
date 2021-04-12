import {
  Model,
  Orm,
  DBInstance,
  Op,
  BelongsToGetAssociationMixin,
} from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';
import _ from 'lodash';

const at = require('trpg-actor-template');

export class ActorTemplate extends Model {
  id: number;
  uuid: string;
  name: string;
  desc: string;
  avatar: string;

  /**
   * @deprecated 这个字段目前没用。看情况是否要删除
   */
  info: string;
  layout: string;
  built_in: boolean;
  is_public: boolean;

  creatorId?: PlayerUser;

  getCreator?: BelongsToGetAssociationMixin<PlayerUser>;

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

  /**
   * 获取模板列表
   * @param page 页数
   * @param size 每页显示条数
   */
  static getList(page = 1, size = 10): Promise<ActorTemplate[]> {
    return ActorTemplate.findAll({
      limit: size,
      offset: (page - 1) * size,
    });
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

  static findByUUID(uuid: string): Promise<ActorTemplate | null> {
    return ActorTemplate.findOne({
      where: { uuid },
    });
  }

  /**
   * 获取推荐模块列表
   */
  static async getRecommendList(): Promise<ActorTemplate[]> {
    const templates = await ActorTemplate.findAll({
      where: {
        built_in: true,
        is_public: true,
      },
    });

    return templates;
  }

  static async createTemplate(
    name: string,
    desc: string,
    avatar: string,
    layout: string,
    playerUUID: string
  ): Promise<ActorTemplate> {
    if (_.isEmpty(name)) {
      throw new Error('缺少模板名');
    }

    if (_.isEmpty(layout)) {
      throw new Error('缺少模板布局');
    }

    const isExistTemplate = await ActorTemplate.findOne({
      where: { name },
      attributes: ['id'],
    });

    if (!_.isNil(isExistTemplate)) {
      throw new Error('该模板名字已存在');
    }

    const user = await PlayerUser.findByUUID(playerUUID);
    const template = await ActorTemplate.create({
      name,
      desc,
      avatar,
      layout,
      creatorId: user.id,
    });

    return template;
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
      info: { type: Sequelize.TEXT }, // 模板信息，弃用
      layout: { type: Sequelize.TEXT({ length: 'medium' }) }, // 模板布局
      built_in: { type: Sequelize.BOOLEAN },
      is_public: { type: Sequelize.BOOLEAN, defaultValue: true },
    },
    { tableName: 'actor_template', sequelize: db, paranoid: true }
  );

  ActorTemplate.belongsTo(PlayerUser, {
    foreignKey: 'creatorId',
    as: 'creator',
  });
  PlayerUser.hasMany(ActorTemplate, {
    foreignKey: 'creatorId',
    as: 'templates',
  });

  return ActorTemplate;
}
