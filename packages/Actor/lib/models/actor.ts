import {
  Model,
  Orm,
  DBInstance,
  BelongsToSetAssociationMixin,
  BelongsToGetAssociationMixin,
} from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';
import _ from 'lodash';
import { Pagination } from 'trpg/query';

export class ActorActor extends Model {
  id: number;
  uuid: string;
  name: string;
  desc: string;
  avatar: string;
  template_uuid: string;
  info: {};
  shared: boolean;
  fork_count: number;

  setOwner?: BelongsToSetAssociationMixin<PlayerUser, number>;
  getOwner?: BelongsToGetAssociationMixin<PlayerUser>;

  static findByUUID(uuid: string): Promise<ActorActor> {
    return ActorActor.findOne({
      where: {
        uuid,
      },
    });
  }

  static async createActor(
    playerUUID: string,
    name: string,
    avatar: string,
    desc: string,
    templateUUID: string,
    info: object
  ): Promise<ActorActor> {
    const user = await PlayerUser.findByUUID(playerUUID);
    if (_.isNil(user)) {
      throw new Error('用户不存在');
    }

    const actor = await ActorActor.create({
      name,
      avatar,
      desc,
      info,
      template_uuid: templateUUID,
      ownerId: user.id,
    });

    return actor;
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

  /**
   * 查找分享的用户UUID
   * @param templateUUID 指定模板UUID 不指定则搜索所有
   * @param page 页数
   * @param limit 每页总是
   */
  static async findSharedActor(
    templateUUID = '',
    page = 1,
    limit = 10
  ): Promise<Pagination<ActorActor>> {
    const where = { shared: true };
    if (!_.isEmpty(templateUUID)) {
      // 如果有设置搜索的模板UUID, 则加入条件
      where['template_uuid'] = templateUUID;
    }

    const [count, list] = await Promise.all([
      ActorActor.count({
        where,
      }),
      ActorActor.findAll({
        where,
        limit,
        offset: (page - 1) * limit,
        order: [['updatedAt', 'desc']],
      }),
    ]);

    return { count, list };
  }

  /**
   * 分享角色
   * @param actorUUID 人物卡UUID
   * @param playerUUID 操作人UUID
   */
  static async shareActor(actorUUID: string, playerUUID: string) {
    const actor = await ActorActor.findByUUID(actorUUID);
    if (_.isNil(actor)) {
      throw new Error('人物卡不存在');
    }

    const owner = await actor.getOwner();
    if (owner.uuid !== playerUUID) {
      throw new Error('没有操作权限, 仅用户本人可以进行分享操作');
    }

    actor.shared = true;
    await actor.save();
  }

  /**
   * 取消分享, 大部分逻辑同上
   */
  static async unshareActor(actorUUID: string, playerUUID: string) {
    const actor = await ActorActor.findByUUID(actorUUID);
    if (_.isNil(actor)) {
      throw new Error('人物卡不存在');
    }

    const owner = await actor.getOwner();
    if (owner.uuid !== playerUUID) {
      throw new Error('没有操作权限, 仅用户本人可以进行分享操作');
    }

    actor.shared = false;
    await actor.save();
  }

  /**
   * fork一个分享的人物卡
   * @param targetActorUUID 目标人物卡UUID
   * @param playerUUID 操作人UUID
   */
  static async forkActor(
    targetActorUUID: string,
    playerUUID: string
  ): Promise<ActorActor> {
    const user = await PlayerUser.findByUUID(playerUUID);
    if (_.isNil(user)) {
      throw new Error('用户不存在');
    }

    const target = await ActorActor.findByUUID(targetActorUUID);
    if (_.isNil(target)) {
      throw new Error('目标人物卡不存在');
    }

    if (!target.shared) {
      throw new Error('该人物卡没有被分享');
    }

    const actor = await ActorActor.createActor(
      user.uuid,
      target.name,
      target.avatar,
      target.desc,
      target.template_uuid,
      target.info
    );

    target.increment('fork_count'); // 不关心操作结果

    return actor;
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
      shared: { type: Sequelize.BOOLEAN, defaultValue: false },
      fork_count: { type: Sequelize.INTEGER, defaultValue: 0 },
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
