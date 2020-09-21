import { Model, Orm, DBInstance } from 'trpg/core';
import _ from 'lodash';
import { hostname } from 'os';

export class BotOperationLog extends Model {
  /**
   * 插入操作日志
   * @param name 操作名
   * @param type 操作类型
   * @param data 操作数据
   */
  static async insertLog(name: string, data?: any): Promise<BotOperationLog> {
    return BotOperationLog.create({
      hostname: hostname(),
      name,
      data,
    });
  }
}

export default function BotOperationLogDefinition(
  Sequelize: Orm,
  db: DBInstance
) {
  BotOperationLog.init(
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      hostname: { type: Sequelize.STRING },
      name: { type: Sequelize.STRING, required: true },
      data: { type: Sequelize.JSON },
    },
    { tableName: 'bot_operation_log', sequelize: db }
  );

  return BotOperationLog;
}
