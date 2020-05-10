import { Model, Orm, DBInstance, Op } from 'trpg/core';
import _ from 'lodash';
import { getDate } from 'lib/helper/date-helper';
import { MomentInput } from 'moment';

interface MetricsStatisCellInfo {
  count: number;
  avg_usage: number;
  max_usage: number;
  min_usage: number;
  sum_usage?: number;
}
interface MetricsStatisInfo {
  [name: string]: {
    date: string;
    info: MetricsStatisCellInfo;
  };
}
interface MetricsStatisInfoRet {
  info: MetricsStatisInfo;
  startDate: string;
  endDate: string;
}
export class CoreMetrics extends Model {
  id: number;
  name: string;
  date: Date;
  type: 'socket' | 'route';
  avg_usage: number;
  max_usage?: number;
  min_usage?: number;
  count: number;

  /**
   * 返回时间段内数据统计情况
   * @param startDate 起始时间
   * @param endDate 结束时间
   */
  static async getStatisInfo(
    startDate: MomentInput,
    endDate: MomentInput
  ): Promise<MetricsStatisInfoRet> {
    startDate = getDate(startDate);
    endDate = getDate(endDate);

    const list: CoreMetrics[] = await CoreMetrics.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    const info: MetricsStatisInfo = _(list)
      .groupBy('type')
      .mapValues((t) =>
        _(t)
          .groupBy('name')
          .mapValues((n) => {
            const cellInfo: MetricsStatisCellInfo = n.reduce(
              (prev, curr) => {
                return {
                  count: prev.count + curr.count,
                  max_usage: Math.max(prev.max_usage, curr.max_usage),
                  min_usage: Math.min(prev.min_usage, curr.min_usage),
                  avg_usage: 0,
                  sum_usage: prev.sum_usage + curr.avg_usage * curr.count,
                };
              },
              {
                count: 0,
                avg_usage: 0,
                max_usage: 0,
                min_usage: 0,
                sum_usage: 0,
              }
            );

            // 计算平均值
            cellInfo.avg_usage = Math.round(
              cellInfo.sum_usage / cellInfo.count
            );

            return cellInfo;
          })
      )
      .value() as any;

    return { info, startDate, endDate };
  }
}

export default function CoreMetricsDefinition(Sequelize: Orm, db: DBInstance) {
  CoreMetrics.init(
    {
      name: {
        type: Sequelize.STRING,
        required: true,
      },
      date: {
        type: Sequelize.DATE,
        required: true,
      },
      type: {
        type: Sequelize.ENUM('socket', 'route'),
        required: true,
        defaultValue: 'socket',
      },
      avg_usage: {
        type: Sequelize.INTEGER,
        required: true,
        comment: 'Usage time of a function or event. unit is ms',
      },
      max_usage: {
        type: Sequelize.INTEGER,
        comment: 'Max usage time of a function or event. unit is ms',
      },
      min_usage: {
        type: Sequelize.INTEGER,
        comment: 'Min usage time of a function or event. unit is ms',
      },
      count: {
        type: Sequelize.INTEGER,
        required: true,
        comment: 'count of this statistics',
      },
    },
    {
      tableName: 'core_metrics',
      sequelize: db,
      timestamps: false,
    }
  );

  return CoreMetrics;
}
