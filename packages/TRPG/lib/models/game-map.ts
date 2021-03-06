import {
  Model,
  Orm,
  DBInstance,
  HasManyGetAssociationsMixin,
  BelongsToGetAssociationMixin,
} from 'trpg/core';
import { GroupGroup } from 'packages/Group/lib/models/group';
import { TokenAttrs, MapData } from 'packages/TRPG/types/map';
import _ from 'lodash';
import { notifyUpdateToken, notifyAddGroupMap } from '../map-notify';
import { checkAllowEditMap } from '../utils/map-data';

/**
 * 游戏地图
 */

declare module 'packages/Group/lib/models/group' {
  interface GroupGroup {
    getMaps: HasManyGetAssociationsMixin<TRPGGameMap>;
  }
}

export class TRPGGameMap extends Model {
  uuid: string;
  name: string;
  width: number;
  height: number;
  data: MapData;

  groupId?: number;

  getGroup?: BelongsToGetAssociationMixin<GroupGroup>;

  static hashCacheKey = (mapUUID: string) => `trpg:map:${mapUUID}:data`;
  static dumpCacheCron = '0 0,10,20,30,40,50 * * * *'; // dump到数据库的计划任务字符串
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

  static async createGroupMap(
    groupUUID: string,
    playerUUID: string,
    name: string,
    width: number,
    height: number
  ): Promise<TRPGGameMap> {
    const group = await GroupGroup.findByUUID(groupUUID);
    if (!group.isManagerOrOwner(playerUUID)) {
      throw new Error('没有创建地图的权限');
    }

    const map = await TRPGGameMap.create({
      name,
      width,
      height,
      groupId: group.id,
    });

    notifyAddGroupMap(groupUUID, map.uuid, map.name);

    return map;
  }

  /**
   * 定期将数据存储到数据库中
   */
  static async dumpMapData(): Promise<void> {
    const app = TRPGGameMap.getApplication();
    const maps = await app.cache.getWithGlob(TRPGGameMap.hashCacheKey('*'));
    if (_.isEmpty(maps)) {
      return;
    }

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
   * 创建一个空白的地图数据
   * @param playerUUIDs 拥有编辑权限的玩家的UUID 用于制作一个简单的权限系统
   */
  static createBlankMapData(playerUUIDs: string[]): MapData {
    return {
      editablePlayer: playerUUIDs,
      layers: [
        {
          _id: 'default',
          name: '默认',
          tokens: [],
        },
      ],
    };
  }

  /**
   * 获取地图数据。优先从缓存中获取
   * @param mapUUID 地图UUID
   */
  static async getMapData(mapUUID: string): Promise<MapData> {
    if (_.isNil(mapUUID)) {
      throw new Error('缺少地图UUID');
    }

    const cacheKey = TRPGGameMap.hashCacheKey(mapUUID);
    const app = TRPGGameMap.getApplication();

    let data = await app.cache.get(cacheKey);
    if (_.isNil(data) || !_.isObject(data)) {
      // 如果没有获取到, 或获取到的缓存信息不正确。则从数据库中获取, 并同步到redis中
      const map = await TRPGGameMap.findByUUID(mapUUID);
      if (_.isNil(map)) {
        throw new Error('找不到该地图');
      }
      data = map.data;

      // 这里是利用cache的缓存机制。这样就不用手动定时任务来清理长时间不变更的地图了
      await app.cache.set(cacheKey, data, {
        expires: TRPGGameMap.expireCacheFrequency,
      });
    }

    return data as any;
  }

  static async saveMapData(mapUUID: string, data: MapData): Promise<void> {
    if (_.isNil(mapUUID)) {
      throw new Error('缺少地图UUID');
    }

    const cacheKey = TRPGGameMap.hashCacheKey(mapUUID);
    const app = TRPGGameMap.getApplication();
    await app.cache.set(cacheKey, data, {
      expires: TRPGGameMap.expireCacheFrequency,
    });
  }

  /**
   * 棋子操作
   */
  static async addToken(
    mapUUID: string,
    playerUUID: string,
    layerId: string,
    token: TokenAttrs
  ) {
    const mapData = await TRPGGameMap.getMapData(mapUUID);

    checkAllowEditMap(mapData, playerUUID); // 简单鉴权

    const layer = _.find(mapData.layers, ['_id', layerId]);
    if (_.isNil(layer)) {
      throw new Error('地图层不存在: ' + layerId);
    }

    layer.tokens.push(token);
    await TRPGGameMap.saveMapData(mapUUID, mapData);

    notifyUpdateToken(mapUUID, 'add', {
      layerId,
      token,
    });
  }
  static async updateToken(
    mapUUID: string,
    playerUUID: string,
    layerId: string,
    tokenId: string,
    tokenAttrs: Partial<TokenAttrs>
  ) {
    const mapData = await TRPGGameMap.getMapData(mapUUID);

    checkAllowEditMap(mapData, playerUUID); // 简单鉴权

    const layer = _.find(mapData.layers, ['_id', layerId]);
    if (_.isNil(layer)) {
      throw new Error('地图层不存在: ' + layerId);
    }

    const token = _.find(layer.tokens, ['_id', tokenId]);
    Object.assign(token, tokenAttrs);
    await TRPGGameMap.saveMapData(mapUUID, mapData);

    notifyUpdateToken(mapUUID, 'update', {
      layerId,
      tokenId,
      tokenAttrs,
    });
  }
  static async removeToken(
    mapUUID: string,
    playerUUID: string,
    layerId: string,
    tokenId: string
  ) {
    const mapData = await TRPGGameMap.getMapData(mapUUID);

    checkAllowEditMap(mapData, playerUUID); // 简单鉴权

    const layer = _.find(mapData.layers, ['_id', layerId]);
    if (_.isNil(layer)) {
      throw new Error('地图层不存在: ' + layerId);
    }

    _.remove(layer.tokens, ['_id', tokenId]);
    await TRPGGameMap.saveMapData(mapUUID, mapData);

    notifyUpdateToken(mapUUID, 'remove', {
      layerId,
      tokenId,
    });
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
      paranoid: true,
      hooks: {
        async beforeCreate(map) {
          if (_.isEmpty(map.data)) {
            const group: GroupGroup = await map.getGroup();
            const playerUUIDs = group.getManagerUUIDs();
            map.data = TRPGGameMap.createBlankMapData(playerUUIDs);
          }
        },
      },
    }
  );

  TRPGGameMap.belongsTo(GroupGroup, { as: 'group', foreignKey: 'groupId' });
  GroupGroup.hasMany(TRPGGameMap, { as: 'maps', foreignKey: 'groupId' });

  return TRPGGameMap;
}
