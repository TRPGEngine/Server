import { Orm, DBInstance, Model } from 'trpg/core';

export class HelpFeedback extends Model {
  username: string;
  contact: string;
  content: string;
}

export default function HelpFeedbackDefinition(Sequelize: Orm, db: DBInstance) {
  HelpFeedback.init(
    {
      username: { type: Sequelize.STRING, required: true },
      contact: { type: Sequelize.STRING },
      content: { type: Sequelize.STRING(1000), required: true },
    },
    {
      tableName: 'help_feedback',
      sequelize: db,
    }
  );

  return HelpFeedback;
}
