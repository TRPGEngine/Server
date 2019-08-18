import { Model, Orm, DBInstance } from 'trpg/core';

export class CoreGlobalConfig extends Model {
  name: string;
  value: string;
}

export default function CoreGlobalConfigDefinition(
  Sequelize: Orm,
  db: DBInstance
) {
  CoreGlobalConfig.init(
    {
      name: {
        type: Sequelize.STRING,
        required: true,
        primaryKey: true,
      },
      value: {
        type: Sequelize.STRING,
        required: true,
        get() {
          const value: string = this.getDataValue('value');
          if (value === 'true') {
            return true;
          }
          if (value === 'false') {
            return false;
          }

          if (!isNaN(Number(value))) {
            // 如果该字符串为数字字符串，则视为数字
            return Number(value);
          }

          try {
            return JSON.parse(value); // 尝试作为JSON字符串解析
          } finally {
            return value;
          }
        },
        set(val) {
          if (typeof val === 'string') {
            this.setDataValue('value', val);
          } else if (typeof val === 'boolean') {
            this.setDataValue('value', String(val));
          } else if (typeof val === 'object') {
            this.setDataValue('value', JSON.stringify(val));
          } else {
            this.setDataValue('value', String(val));
          }
        },
      },
    },
    {
      tableName: 'core_global_config',
      sequelize: db,
    }
  );

  return CoreGlobalConfig;
}
