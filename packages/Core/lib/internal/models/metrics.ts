import { Model, Orm, DBInstance } from 'trpg/core';

export class CoreMetrics extends Model {
  id: number;
  name: string;
  date: Date;
  type: 'socket' | 'route';
  avg_usage: number;
  max_usage?: number;
  min_usage?: number;
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
