import { Model, Orm, DBInstance } from 'trpg/core';

export class DiceLog extends Model {
  uuid: string;
  sender_uuid: string;
  to_uuid: string;
  is_group: boolean;
  is_private: boolean;
  dice_request: string;
  dice_expression: string;
  dice_result: number;
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
