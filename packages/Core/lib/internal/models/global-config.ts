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
      },
    },
    {
      tableName: 'core_global_config',
      sequelize: db,
    }
  );

  return CoreGlobalConfig;
}
