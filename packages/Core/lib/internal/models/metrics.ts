import { Model, Orm, DBInstance } from 'trpg/core';

export class CoreMetrics extends Model {
  id: number;
  name: string;
  date: Date;
  type: 'socket' | 'route';
  usage: number;
  count: number;
}

export default function CoreMetricsDefinition(Sequelize: Orm, db: DBInstance) {
  CoreMetrics.init(
    {
      name: {
        type: Sequelize.STRING,
        required: true,
      },
      date: {
        type: Sequelize.DATEONLY,
        required: true,
      },
      type: {
        type: Sequelize.ENUM('socket', 'route'),
        required: true,
        defaultValue: 'socket',
      },
      usage: {
        type: Sequelize.INTEGER,
        required: true,
        comment: 'usage time of a function or event. unit is ms',
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
    }
  );

  return CoreMetrics;
}
