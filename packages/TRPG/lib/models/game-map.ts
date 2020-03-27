import {
  Model,
  Orm,
  DBInstance,
  BelongsToManyGetAssociationsMixin,
} from 'trpg/core';
import { GroupGroup } from 'packages/Group/lib/models/group';

/**
 * 游戏地图
 */

export type MapTokenModifyType = 'add' | 'update' | 'remove';
export type MapTokenModifyPayload = {
  id: string; // 客户端生成的shortid
  data?: {};
};

declare module 'packages/Group/lib/models/group' {
  interface GroupGroup {
    getMaps: BelongsToManyGetAssociationsMixin<TRPGGameMap>;
  }
}

export class TRPGGameMap extends Model {
  uuid: string;
  name: string;
  tokens: {};

  static async findByUUID(uuid: string) {
    return TRPGGameMap.findOne({
      where: { uuid },
    });
  }

  /**
   * 获取团所有地图列表
   * @param groupUUID 团UUID
   */
  static async getGroupMapList(
    groupUUID: string
  ): Promise<Pick<TRPGGameMap, 'uuid' | 'name'>[]> {
    const group = await GroupGroup.findByUUID(groupUUID);
    const maps = await group.getMaps({
      attributes: ['uuid', 'name'],
    });

    return maps;
  }

  static addToken() {
    // TODO
  }

  static updateToken() {
    // TODO
  }

  static removeToken() {
    // TODO
  }
}

export default function TRPGMapDefinition(Sequelize: Orm, db: DBInstance) {
  TRPGGameMap.init(
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      name: { type: Sequelize.STRING },
      width: { type: Sequelize.INTEGER },
      tokens: { type: Sequelize.JSON, defaultValue: {} },
    },
    {
      tableName: 'trpg_game_map',
      sequelize: db,
    }
  );

  TRPGGameMap.belongsTo(GroupGroup, { as: 'group', foreignKey: 'groupId' });
  GroupGroup.hasMany(TRPGGameMap, { as: 'maps', foreignKey: 'groupId' });

  return TRPGGameMap;
}
