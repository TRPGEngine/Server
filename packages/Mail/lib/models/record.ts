import { Model, Orm, DBInstance } from 'trpg/core';

export class MailRecord extends Model {
  user_uuid: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  host: string;
  port: string;
  secure: boolean;
  is_success: boolean;
  data: any;
  error: string;
}

export default function MailRecordDefinition(Sequelize: Orm, db: DBInstance) {
  MailRecord.init(
    {
      user_uuid: { type: Sequelize.UUID, required: true },
      from: { type: Sequelize.STRING, required: true },
      to: { type: Sequelize.STRING, required: true },
      subject: { type: Sequelize.STRING, required: true },
      body: { type: Sequelize.TEXT },
      host: { type: Sequelize.STRING, required: true },
      port: { type: Sequelize.STRING, required: true },
      secure: { type: Sequelize.BOOLEAN, defaultValue: true },
      is_success: { type: Sequelize.BOOLEAN, defaultValue: true },
      data: { type: Sequelize.JSON },
      error: { type: Sequelize.STRING(1000) },
    },
    {
      tableName: 'mail_record',
      sequelize: db,
    }
  );

  return MailRecord;
}
