import { Model, Orm, DBInstance } from 'trpg/core';
import { ChatMessagePartial } from 'packages/Chat/types/message';

export class DiceLog extends Model {
  uuid: string;
  sender_uuid: string;
  to_uuid: string;
  is_group: boolean;
  is_private: boolean;
  dice_request: string;
  dice_expression: string;
  dice_result: number;

  /**
   * 记录投骰结果
   * @param req 请求参数
   * @param exp 计算公式
   * @param res 计算结果
   * @param payload 消息体
   */
  static async recordDiceLog(
    req: string,
    exp: string,
    res: number,
    payload: ChatMessagePartial
  ) {
    const {
      sender_uuid,
      converse_uuid,
      to_uuid,
      is_group,
      is_public,
    } = payload;
    await DiceLog.create({
      sender_uuid,
      to_uuid: is_group ? converse_uuid : to_uuid,
      is_group,
      is_private: !is_public,
      dice_request: req,
      dice_expression: exp,
      dice_result: res,
    });
  }
}

export default function DiceLogDefinition(Sequelize: Orm, db: DBInstance) {
  DiceLog.init(
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      sender_uuid: { type: Sequelize.UUID, required: false },
      to_uuid: { type: Sequelize.UUID, required: false },
      is_group: { type: Sequelize.BOOLEAN },
      is_private: { type: Sequelize.BOOLEAN },
      dice_request: { type: Sequelize.STRING },
      dice_expression: { type: Sequelize.STRING(1000) },
      dice_result: { type: Sequelize.INTEGER },
    },
    {
      tableName: 'dice_log',
      sequelize: db,
    }
  );

  return DiceLog;
}
