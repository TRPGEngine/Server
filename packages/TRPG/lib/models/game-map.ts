import {
  Model,
  Orm,
  DBInstance,
  BelongsToManyGetAssociationsMixin,
} from 'trpg/core';
import { GroupGroup } from 'packages/Group/lib/models/group';
import { TokenAttrs, MapData } from 'packages/TRPG/types/map';
import _ from 'lodash';

/**
 * 游戏地图
 */

declare module 'packages/Group/lib/models/group' {
  interface GroupGroup {
    getMaps: BelongsToManyGetAssociationsMixin<TRPGGameMap>;
  }
}

export class TRPGGameMap extends Model {
  uuid: string;
  name: string;
  width: number;
  height: number;
  data: MapData;

  static hashCacheKey = (mapUUID: string) => `trpg:map:${mapUUID}:data`;
  static dumpCacheFrequency = 10 * 60 * 1000; // dump到数据库的频率 单位毫秒
  static expireCacheFrequency = 30 * 60 * 1000; // 地图缓存过期时间(利用redis的过期机制)，这个时间需要大于dumpCacheFrequency以保证过期时已同步到数据库

  static async findByUUID(uuid: string): Promise<TRPGGameMap> {
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

  /**
   * 定期将数据存储到数据库中
   */
  static async dumpMapData(): Promise<void> {
    const app = TRPGGameMap.getApplication();
    const maps = await app.cache.getWithGlob(TRPGGameMap.hashCacheKey('*'));
    await Promise.all(
      Object.entries(maps).map(([mapUUID, mapData]) =>
        TRPGGameMap.update(
          {
            data: mapData,
          },
          {
            where: {
              uuid: mapUUID,
            },
          }
        )
      )
    );
  }

  /**
   * 获取地图数据。优先从缓存中获取
   * @param mapUUID 地图UUID
   */
  static async getMapData(mapUUID: string): Promise<MapData> {
    if (_.isNil(mapUUID)) {
      return null;
    }

    const cacheKey = TRPGGameMap.hashCacheKey(mapUUID);
    const app = TRPGGameMap.getApplication();

    let data = await app.cache.get(cacheKey);
    if (_.isNil(data) || !_.isObject(data)) {
      // 如果没有获取到, 或获取到的缓存信息不正确。则从数据库中获取, 并同步到redis中
      const map = await TRPGGameMap.findByUUID(mapUUID);
      data = map.data;

      // 这里是利用cache的缓存机制。这样就不用手动定时任务来清理长时间不变更的地图了
      await app.cache.set(cacheKey, data, {
        expires: TRPGGameMap.expireCacheFrequency,
      });
    }

    return data as any;
  }

  /**
   * 棋子操作
   */
  static async addToken(mapUUID: string, layerId: string, attrs: TokenAttrs) {
    // TODO
  }
  static async updateToken(
    mapUUID: string,
    tokenId: string,
    tokenAttrs: Partial<TokenAttrs>
  ) {
    // TODO
  }
  static async removeToken(mapUUID: string, tokenId: string) {
    // TODO
  }
}

export default function TRPGMapDefinition(Sequelize: Orm, db: DBInstance) {
  TRPGGameMap.init(
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      name: { type: Sequelize.STRING },
      width: { type: Sequelize.INTEGER },
      height: { type: Sequelize.INTEGER },
      data: { type: Sequelize.JSON, defaultValue: {} },
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
