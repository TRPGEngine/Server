import { Model, Orm, DBInstance } from 'trpg/core';

export class ReportError extends Model {}

export default function ReportErrorDefinition(Sequelize: Orm, db: DBInstance) {
  ReportError.init(
    {
      ip: { type: Sequelize.STRING, required: true },
      ua: { type: Sequelize.TEXT },
      version: { type: Sequelize.STRING },
      message: { type: Sequelize.TEXT, required: true },
      stack: { type: Sequelize.TEXT, required: true },
    },
    {
      tableName: 'report_error',
      sequelize: db,
    }
  );

  return ReportError;
}
