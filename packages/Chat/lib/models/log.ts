import { Model, Orm, DBInstance } from 'trpg/core';
import {
  ChatMessageType,
  ChatMessagePayload,
} from 'packages/Chat/types/message';

export class ChatLog extends Model implements ChatMessagePayload {
  uuid: string;
  sender_uuid: string;
  to_uuid: string;
  converse_uuid: string;
  message: string;
  type: ChatMessageType;
  data: object;
  is_group: boolean;
  is_public: boolean;
  date: string;
}

export default function LogDefinition(Sequelize: Orm, db: DBInstance) {
  ChatLog.init(
    {
      uuid: {
        type: Sequelize.UUID,
        required: true,
        defaultValue: Sequelize.UUIDV4,
      },
      sender_uuid: { type: Sequelize.STRING, required: true },
      to_uuid: { type: Sequelize.STRING },
      converse_uuid: { type: Sequelize.STRING },
      message: { type: Sequelize.STRING(1000) },
      type: {
        type: Sequelize.ENUM(
          'normal',
          'system',
          'ooc',
          'speak',
          'action',
          'cmd',
          'card',
          'tip',
          'file'
        ),
      },
      data: { type: Sequelize.JSON },
      is_group: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_public: { type: Sequelize.BOOLEAN, defaultValue: true },
      date: { type: Sequelize.DATE },
    },
    {
      tableName: 'chat_log',
      sequelize: db,
    }
  );

  return ChatLog;
}
