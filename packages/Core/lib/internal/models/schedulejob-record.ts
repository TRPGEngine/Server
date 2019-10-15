import { Model, Orm, DBInstance } from 'trpg/core';
import { hostname } from 'os';

export type CoreSchedulejobRecordType =
  | 'stat'
  | 'schedule'
  | 'custom'
  | 'unknown';

export class CoreSchedulejobRecord extends Model {
  id: number;

  /**
   * 计划任务名
   */
  name: string;

  /**
   * 计划任务类型
   */
  type: CoreSchedulejobRecordType;

  /**
   * 执行主机名
   */
  hostname: string;

  /**
   * 计划任务执行结果
   */
  result?: string;

  /**
   * 计划任务是否完成
   */
  completed: boolean;

  /**
   * 创建一条记录
   * @param name 任务名
   * @param type 任务类型
   */
  static async createRecord(
    name: string,
    type: CoreSchedulejobRecordType = 'unknown'
  ): Promise<CoreSchedulejobRecord> {
    const history = await CoreSchedulejobRecord.create<CoreSchedulejobRecord>({
      name,
      type,
      hostname: hostname(),
    });

    return history;
  }
}

export default function CoreSchedulejobHistoryDefinition(
  Sequelize: Orm,
  db: DBInstance
) {
  CoreSchedulejobRecord.init(
    {
      name: {
        type: Sequelize.STRING,
        required: true,
      },
      type: {
        type: Sequelize.ENUM('stat', 'schedule', 'custom', 'unknown'),
        defaultValue: 'unknown',
      },
      hostname: {
        type: Sequelize.STRING,
      },
      result: {
        type: Sequelize.STRING,
      },
      completed: {
        type: Sequelize.BOOLEAN,
      },
    },
    { tableName: 'core_schedulejob_history', sequelize: db, updatedAt: false }
  );

  return CoreSchedulejobRecord;
}
