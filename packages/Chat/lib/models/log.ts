import { Model, Orm, DBInstance } from 'trpg/core';
import {
  ChatMessageType,
  ChatMessagePayload,
  ChatMessagePartial,
} from 'packages/Chat/types/message';
import _ from 'lodash';
import generateUUID from 'uuid/v4';
import Debug from 'debug';
const debug = Debug('trpg:component:chat:model:log');

export class ChatLog extends Model implements ChatMessagePayload {
  static CACHE_KEY = 'chat:log-cache';
  static CACHE_DUMP_LOCK = 'chat:dumpLog';

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

  /**
   * 获取缓存的聊天记录
   */
  public static async getCachedChatLog(): Promise<ChatMessagePartial[]> {
    const trpgapp = ChatLog.getApplication();
    const cachedList = await trpgapp.cache.lget(ChatLog.CACHE_KEY);
    return cachedList.filter<object>((i): i is object => _.isObject(i));
  }

  /**
   * 往缓存的聊天记录里塞数据
   */
  public static appendCachedChatLog(
    payload: ChatMessagePartial
  ): ChatMessagePartial {
    const app = ChatLog.getApplication();

    // 预处理数据
    if (_.isEmpty(payload.uuid)) {
      payload.uuid = generateUUID();
    }
    const date = _.isEmpty(payload.date) ? new Date() : new Date(payload.date);
    payload.date = date.toISOString();

    // 这里直接向redis发送消息。不等待返回
    // 这样可以同步向
    app.cache.rpush(ChatLog.CACHE_KEY, payload).catch((err) => {
      // 缓存记录失败。直接写入数据库
      app.error('向Redis添加聊天记录失败。直接写入数据库: ' + payload.uuid);
      ChatLog.create(payload);
    });

    return payload;
  }

  /**
   * 更新缓存的聊天记录的数据
   * @param index 缓存位置
   * @param payload 内容
   */
  public static async updateCachedChatLog(
    index: number,
    payload: ChatMessagePartial
  ): Promise<void> {
    const trpgapp = ChatLog.getApplication();
    await trpgapp.cache.lset(ChatLog.CACHE_KEY, index, payload);
  }

  /**
   * 将缓存的聊天记录推送到数据库中
   */
  public static async dumpCachedChatLog(): Promise<void> {
    const trpgapp = ChatLog.getApplication();

    await trpgapp.cache.lockScope(ChatLog.CACHE_DUMP_LOCK, async () => {
    const logs: {}[] = await ChatLog.getCachedChatLog();
    const size = logs.length;
    if (size > 0) {
      await trpgapp.cache.lclear(ChatLog.CACHE_KEY, 0, size);
      await ChatLog.bulkCreate(logs);
    }
    });
  }

  /**
   * 发送消息
   */
  public static async sendMsg(
    payload: ChatMessagePayload
  ): Promise<ChatMessagePartial> {
    const app = ChatLog.getApplication();
    debug('发送消息: [to %s] %o', payload.to_uuid, payload);
    const log = ChatLog.appendCachedChatLog(payload);

    if (payload.is_public) {
      // 是私密消息
      app.player.manager.unicastSocketEvent(
        payload.to_uuid,
        'chat::message',
        log
      );
    } else {
      // 是公开消息
      if (!payload.is_group) {
        // TODO: 这里好像有问题, 需要检查一下
        // 疑问: 什么情况下会出现公开的用户信息？
        app.player.manager.broadcastSocketEvent('chat::message', log);
      } else {
        // TODO: 需要校验
        app.player.manager.roomcastSocketEvent(
          payload.converse_uuid,
          'chat::message',
          log
        );
      }
    }

    return log;
  }

  /**
   * 发送个人系统消息
   */
  public static async sendSystemMsg(
    payload: Pick<
      ChatMessagePayload,
      'to_uuid' | 'converse_uuid' | 'message' | 'type' | 'data'
    >
  ): Promise<ChatMessagePartial> {
    const { to_uuid, converse_uuid, message, type, data } = payload;
    const full: ChatMessagePayload = {
      uuid: generateUUID(),
      sender_uuid: 'trpgsystem',
      to_uuid,
      message,
      converse_uuid,
      // 如果有具体的发送对象，则为私有消息，否则则为公共消息
      is_public: _.isNil(to_uuid) ? false : true,
      is_group: false,
      type,
      data,
      date: new Date().toISOString(),
    };

    return await ChatLog.sendMsg(full);
  }

  /**
   * 发送简单个人系统消息
   * @param to_uuid 发送系统消息的对象
   * @param message 发送系统消息的内容
   */
  public static sendSimpleSystemMsg(
    to_uuid: string | null,
    converse_uuid: string | null,
    message: string
  ): Promise<ChatMessagePartial> {
    return ChatLog.sendSystemMsg({
      to_uuid,
      converse_uuid,
      message,
      // 如果是私人会话，则类型为normal
      type: _.isNil(converse_uuid) ? 'normal' : 'tip',
      data: null,
    });
  }
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
