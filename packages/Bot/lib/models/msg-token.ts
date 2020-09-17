import { Model, Orm, DBInstance } from 'trpg/core';
import _ from 'lodash';
import { ChatLog } from 'packages/Chat/lib/models/log';
import { ChatMessagePayload } from 'packages/Chat/types/message';
import { generateChatMsgUUID } from 'packages/Chat/lib/utils';

export class BotMsgToken extends Model {
  uuid: string;
  token: string;
  name: string;
  group_uuid: string;
  channel_uuid: string | null;

  /**
   * 根据token获取机器人
   */
  static async findByToken(token: string): Promise<BotMsgToken> {
    return BotMsgToken.findOne({
      where: {
        token,
      },
    });
  }

  /**
   * 创建机器人
   * @param name 机器人名
   * @param group_uuid 团UUID
   * @param channel_uuid 频道UUID 可以为空
   */
  static async createMsgToken(
    name: string,
    group_uuid: string,
    channel_uuid?: string
  ): Promise<BotMsgToken> {
    const bot = await BotMsgToken.create({
      name,
      group_uuid,
      channel_uuid,
    });

    return bot;
  }

  /**
   * 机器人发送消息
   * @param token 机器人的Token
   * @param msg 消息
   * @param data 额外数据
   */
  static async sendMsgWithToken(
    token: string,
    msg: string,
    data?: any
  ): Promise<Partial<ChatMessagePayload>> {
    const model = await BotMsgToken.findByToken(token);

    if (_.isNil(model)) {
      throw new Error('找不到该机器人');
    }

    const payload: ChatMessagePayload = {
      uuid: generateChatMsgUUID(),
      message: msg,
      sender_uuid: null,
      to_uuid: null,
      converse_uuid: model.group_uuid,
      is_public: true,
      is_group: true,
      type: 'normal',
      date: new Date().toISOString(),
      data: {
        name: model.name,
        bot: {
          uuid: model.uuid,
        },
        ...data,
      },
    };

    if (!_.isNil(model.channel_uuid)) {
      payload.converse_uuid = model.channel_uuid;
      payload.group_uuid = model.group_uuid;
    }

    const pkg = await ChatLog.sendMsg(payload);

    return pkg;
  }
}

export default function BotMsgTokenDefinition(Sequelize: Orm, db: DBInstance) {
  BotMsgToken.init(
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      token: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      name: { type: Sequelize.STRING, allowNull: false },
      group_uuid: { type: Sequelize.STRING, allowNull: false },
      channel_uuid: { type: Sequelize.STRING },
    },
    { tableName: 'bot_msg_token', sequelize: db }
  );

  return BotMsgToken;
}
