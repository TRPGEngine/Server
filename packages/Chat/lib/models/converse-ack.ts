import { Model, Orm, DBInstance } from 'trpg/core';

/**
 * 用于记录会话最后浏览的消息列表
 */
export class ChatConverseAck extends Model {
  user_uuid: string;
  converse_uuid: string;
  last_log_uuid: string;

  /**
   * 设置会话消息已收到
   * @param converseUUID 会话UUID
   * @param lastLogUUID 最后收到的消息的UUID
   */
  static async setConverseAck(
    userUUID: string,
    converseUUID: string,
    lastLogUUID: string
  ) {
    const ack: ChatConverseAck = await ChatConverseAck.findOne({
      where: {
        user_uuid: userUUID,
        converse_uuid: converseUUID,
      },
    });
    if (ack) {
      // 已存在
      ack.last_log_uuid = lastLogUUID;
      await ack.save();
    } else {
      await ChatConverseAck.create({
        user_uuid: userUUID,
        converse_uuid: converseUUID,
        last_log_uuid: lastLogUUID,
      });
    }
  }
}

export default function ChatConverseAckDefinition(
  Sequelize: Orm,
  db: DBInstance
) {
  ChatConverseAck.init(
    {
      user_uuid: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      converse_uuid: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      last_log_uuid: {
        type: Sequelize.UUID,
        allowNull: false,
      },
    },
    {
      tableName: 'chat_converse_ack',
      sequelize: db,
      indexes: [
        {
          fields: ['user_uuid', 'converse_uuid'],
          unique: true,
        },
      ],
    }
  );

  return ChatConverseAck;
}
