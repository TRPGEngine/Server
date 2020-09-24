import { Model, Orm, DBInstance } from 'trpg/core';
import _ from 'lodash';
import { ChatLog } from 'packages/Chat/lib/models/log';
import { ChatMessagePayload } from 'packages/Chat/types/message';
import { generateChatMsgUUID } from 'packages/Chat/lib/utils';
import { BotOperationLog } from './operation-log';
import { GroupGroup } from 'packages/Group/lib/models/group';

export class BotMsgToken extends Model {
  uuid: string; // 机器人标识符 不暴露给外部
  token: string; // 机器人验证 暴露给外部 允许重新生成
  name: string;
  group_uuid: string;
  channel_uuid: string | null;

  static MSG_SENDER_UUID = 'trpgbot'; // 用于标识发送者的内容

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
    groupUUID: string,
    channelUUID: string | null | undefined,
    operatorUserUUID: string
  ): Promise<BotMsgToken> {
    const group = await GroupGroup.findByUUID(groupUUID);
    const isManager = group.isManagerOrOwner(operatorUserUUID);
    if (isManager === false) {
      throw new Error('不是团管理员, 没有权限');
    }

    const bot = await BotMsgToken.create({
      name,
      group_uuid: groupUUID,
      channel_uuid: channelUUID,
    });

    await BotOperationLog.insertLog('create-msg-token', { bot });

    return bot;
  }

  /**
   * 获取机器人列表
   * @param groupUUID 团UUID
   * @param operatorUserUUID 操作人UUID
   */
  static async getMsgTokenList(
    groupUUID: string,
    operatorUserUUID: string
  ): Promise<BotMsgToken[]> {
    const group = await GroupGroup.findByUUID(groupUUID);

    const isManager = group.isManagerOrOwner(operatorUserUUID);
    if (isManager === false) {
      throw new Error('不是团管理员, 没有权限');
    }

    const list = await BotMsgToken.findAll({
      where: {
        group_uuid: groupUUID,
      },
    });

    return list;
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
      sender_uuid: BotMsgToken.MSG_SENDER_UUID,
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

    BotOperationLog.insertLog('send-msg-with-token', { token, pkg });

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
