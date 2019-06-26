import { Model, Orm, DBInstance } from 'trpg/core';

export class CoreSystemLog extends Model {
  id: number;

  /**
   * 系统记录的名称
   */
  name: string;

  /**
   * 系统记录的类型、归类
   */
  type: string;

  /**
   * 系统记录消息信息
   */
  message: string;

  /**
   * 系统记录附加信息
   */
  data: {};
}

export default function CoreSystemLogDefinition(
  Sequelize: Orm,
  db: DBInstance
) {
  CoreSystemLog.init(
    {
      name: {
        type: Sequelize.STRING,
        required: true,
      },
      type: {
        type: Sequelize.STRING,
        required: true,
      },
      message: {
        type: Sequelize.STRING,
      },
      data: {
        type: Sequelize.JSON,
      },
    },
    { tableName: 'core_system_log', sequelize: db, updatedAt: false }
  );

  return CoreSystemLog;
}
