import _ from 'lodash';
import { DBInstance, Model, Orm } from 'trpg/core';

interface CoreStatsMap {
  [key: string]: string | number;
}

export class CoreStats extends Model {
  key: string;
  value: string | number;

  /**
   * 获取所有的统计数据
   */
  static async getAllStats(): Promise<CoreStatsMap> {
    const list: CoreStats[] = await CoreStats.findAll();

    const stats: CoreStatsMap = {};
    for (let item of list) {
      stats[item.key] = item.value;
    }

    return stats;
  }

  /**
   * 设置统计数据
   */
  static async setStats(map: CoreStatsMap): Promise<void> {
    const list = _.toPairs(map).map(([key, value]) => ({ key, value }));
    await CoreStats.bulkCreate(list, {
      updateOnDuplicate: ['value'],
    });
  }
}

export default function CoreStatsDefinition(Sequelize: Orm, db: DBInstance) {
  CoreStats.init(
    {
      key: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      value: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      remark: {
        type: Sequelize.STRING,
      },
    },
    {
      tableName: 'core_stats',
      sequelize: db,
      timestamps: false,
    }
  );

  return CoreStats;
}
