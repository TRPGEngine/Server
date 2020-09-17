import { Model, Orm, DBInstance, Op } from 'trpg/core';
import {
  ChatMessageType,
  ChatMessagePayload,
  ChatMessagePartial,
} from 'packages/Chat/types/message';
import _ from 'lodash';
import emoji from 'node-emoji';
import Debug from 'debug';
import { notifyUpdateMessage } from '../notify';
import { NoReportError } from 'lib/error';
import { generateChatMsgUUID } from '../utils';
const debug = Debug('trpg:component:chat:model:log');

export class ChatLog extends Model implements ChatMessagePayload {
  static CACHE_KEY = 'chat:log-cache';
  static CACHE_DUMP_LOCK = 'chat:dumpLog';
  static MESSAGE_TYPE_BLACKLIST = [
    //'card', // 发送角色卡用的是卡片类型的消息
    'tip',
  ]; // 不在通用处理而是在入口处(消息事件)处理。 内部代发允许使用这些字段

  uuid: string;
  sender_uuid: string;
  to_uuid: string;
  converse_uuid: string;
  group_uuid: string;
  message: string;
  type: ChatMessageType;
  data: object;
  is_group: boolean;
  is_public: boolean;
  date: string;
  revoke: boolean;

  public static async findByUUID(uuid: string): Promise<ChatLog> {
    return ChatLog.findOne({
      where: {
        uuid,
      },
    });
  }

  /**
   * 在数据库或内存中查找消息
   */
  public static async findDeepByUUID(
    uuid: string
  ): Promise<{
    msg: ChatMessagePartial;
    inCache: boolean;
  }> {
    let msg: ChatMessagePartial = await ChatLog.findByUUID(uuid);
    let inCache = false;
    if (_.isNil(msg)) {
      // 在数据库中没有找到，尝试在缓存中查找
      msg = await ChatLog.getCachedChatLogByUUID(uuid);
      if (_.isNil(msg)) {
        throw new Error('找不到此信息');
      }
      inCache = true;
    }

    return {
      msg,
      inCache,
    };
  }

  /**
   * 获取一定范围内的所有会话内容
   * @param converseUUID 会话UUID
   * @param from 开始时间
   * @param to 结束时间
   */
  public static async findRangeConverseLog(
    converseUUID: string,
    from: string,
    to: string
  ): Promise<ChatLog[]> {
    return ChatLog.findAll({
      where: {
        converse_uuid: converseUUID,
        revoke: false, // 获取范围聊天记录时不返回撤回的消息
        date: { [Op.between]: [from, to] },
      },
    });
  }

  /**
   * 更新消息内容
   * @param uuid 消息UUID
   * @param payload 要更新的消息内容, 可以为部分参数
   */
  public static async updateByUUID(
    uuid: string,
    payload: ChatMessagePartial
  ): Promise<ChatMessagePayload> {
    const app = ChatLog.getApplication();

    let isSaved = false;

    // 先在缓存中查找数据
    let fullPayload: ChatMessagePayload;
    await app.cache.lockScope(ChatLog.CACHE_DUMP_LOCK, async () => {
      const list = await ChatLog.getCachedChatLog();
      const index = list.findIndex((item) => item.uuid === uuid);
      if (index >= 0) {
        fullPayload = {
          ...list[index],
          ...payload,
        };
        await ChatLog.updateCachedChatLog(index, fullPayload);
        isSaved = true;
      }
    });

    if (!isSaved) {
      // 如果没有则在数据库中查找并更新
      const msg = await ChatLog.findByUUID(uuid);
      _.merge(fullPayload, payload);
      await msg.save();

      fullPayload = msg.toJSON() as ChatMessagePayload;
    }

    // 更新完毕后通知相关用户更新消息
    notifyUpdateMessage(uuid, fullPayload);

    return fullPayload;
  }

  /**
   * 获取缓存的聊天记录
   */
  public static async getCachedChatLog(): Promise<ChatMessagePayload[]> {
    const trpgapp = ChatLog.getApplication();
    const cachedList = await trpgapp.cache.lget(ChatLog.CACHE_KEY);
    return cachedList.filter((i): i is ChatMessagePayload => _.isObject(i));
  }

  /**
   * 根据消息UUID获取缓存的聊天记录
   */
  public static async getCachedChatLogByUUID(
    msgUUID: string
  ): Promise<ChatMessagePayload> {
    const cachedList = await ChatLog.getCachedChatLog();
    return cachedList.find((msg) => msg.uuid === msgUUID);
  }

  /**
   * 往缓存的聊天记录里塞数据
   * 并对消息进行一些处理
   */
  public static appendCachedChatLog(
    payload: ChatMessagePartial
  ): ChatMessagePartial {
    const app = ChatLog.getApplication();

    // 预处理数据
    if (_.isEmpty(payload.uuid)) {
      payload.uuid = generateChatMsgUUID();
    }
    const date = _.isEmpty(payload.date) ? new Date() : new Date(payload.date);
    payload.date = date.toISOString();
    payload.message = emoji.unemojify(payload.message);

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
        await ChatLog.bulkCreate(logs);
        // 成功后再清除。否则先不清除了
        await trpgapp.cache.lclear(ChatLog.CACHE_KEY, 0, size);
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

    if (!log.is_public) {
      // 是私密消息
      const isOnline = await app.player.manager.checkPlayerOnline(log.to_uuid);
      if (isOnline) {
        // 如果用户在线则直接发送单播通知
        await app.player.manager.unicastSocketEvent(
          log.to_uuid,
          'chat::message',
          log
        );
      } else {
        // 如果用户离线则试图直接通知
        debug(
          '[用户:%s]: 接收方%s不在线, 尝试发送通知',
          log.sender_uuid,
          log.to_uuid
        );
        app.chat.tryNotify(log);
      }
    } else {
      // 是公开消息
      if (!log.is_group) {
        // TODO: 这里好像有问题, 需要检查一下
        // 疑问: 什么情况下会出现公开的用户信息？
        // await app.player.manager.broadcastSocketEvent('chat::message', log);
        throw new Error('出现异常, 不支持的广播消息');
      } else {
        const roomUUID = log.group_uuid ?? log.converse_uuid;
        await app.player.manager.roomcastSocketEvent(
          roomUUID,
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

    const isPrivateMsg = _.isNil(converse_uuid); // 如果没有会话ID则为私人消息

    const full: ChatMessagePayload = {
      uuid: generateChatMsgUUID(),
      sender_uuid: 'trpgsystem',
      to_uuid,
      message,
      converse_uuid,
      // 要么都为true 要么都为false
      is_public: isPrivateMsg ? false : true,
      is_group: isPrivateMsg ? false : true,
      type,
      data,
      date: new Date().toISOString(),
    };

    return await ChatLog.sendMsg(full);
  }

  /**
   * 发送简单个人系统消息
   * @param to_uuid 发送系统消息的对象，与converse_uuid必须有一个
   * @param converse_uuid 会话消息，与to_uuid必须有一个
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

  /**
   * 往多人会话中发送系统消息
   * 如果有to_uuid则为群聊中的私人会话
   */
  public static sendConverseSystemMsg(
    converseUUID: string,
    message: string,
    to_uuid: string = null
  ) {
    return ChatLog.sendMsg({
      uuid: generateChatMsgUUID(),
      sender_uuid: 'trpgsystem',
      to_uuid,
      converse_uuid: converseUUID,
      message,
      is_public: _.isNil(to_uuid) ? true : false,
      is_group: true,
      type: 'tip',
      data: null,
      date: new Date().toISOString(),
    });
  }

  /**
   * 撤回消息
   * @param msgUUID 消息UUID
   * @param userUUID 操作者UUID
   */
  public static async revokeMsg(msgUUID: string, userUUID: string) {
    let msg: ChatMessagePayload = await ChatLog.findByUUID(msgUUID);
    let isCachedMsg = false;
    let isGroupManagerRevoke = false; // 是否为团管理员的撤回(没有时间限制)
    if (_.isNil(msg)) {
      // 在数据库中没有找到，尝试在缓存中查找
      msg = await ChatLog.getCachedChatLogByUUID(msgUUID);
      if (_.isNil(msg)) {
        throw new Error('撤回失败, 找不到此信息');
      }
      isCachedMsg = true;
    }

    const app = ChatLog.getApplication();

    /**
     * 校验撤回权限
     */
    if (userUUID !== msg.sender_uuid) {
      // 如果不是发送者
      if (!msg.is_group) {
        // 不是团消息，直接返回错误
        throw new Error('撤回失败, 没有撤回权限');
      }

      const groupUUID = msg.converse_uuid;
      if (!_.isEmpty(groupUUID)) {
        throw new Error('撤回失败, 消息内容异常');
      }

      if (app.hasPackage('Group')) {
        const { GroupGroup } = await import('packages/Group/lib/models/group');
        const group = await GroupGroup.findByUUID(msg.converse_uuid);
        if (!group.isManagerOrOwner(userUUID)) {
          // 不是管理员
          throw new NoReportError('撤回失败, 没有撤回权限');
        }

        isGroupManagerRevoke = true;
      }
    }

    /**
     * 校验撤回时间
     */
    const now = new Date().valueOf();
    const msgDate = new Date(msg.date).valueOf();
    if (!(isGroupManagerRevoke || now - msgDate <= 2 * 60 * 1000)) {
      throw new NoReportError('撤回失败, 已超出撤回时间');
    }
    // 如果撤回时间在2分钟内，或为管理员撤回则允许撤回

    // 撤回消息
    // 撤回消息时特殊的，消息类型不变但会在客户端显示成撤回一条消息的系统提示
    const updatedMsgPayload = {
      revoke: true,
      message: '[撤回消息]',
      data: {
        origin: msg.message,
        ...msg.data,
      },
    };
    let isRevoked = false;
    if (isCachedMsg) {
      await app.cache.lockScope(ChatLog.CACHE_DUMP_LOCK, async () => {
        const list = await ChatLog.getCachedChatLog();
        const index = list.findIndex((item) => item.uuid === msgUUID);
        if (index >= 0) {
          await ChatLog.updateCachedChatLog(index, {
            ...list[index],
            ...updatedMsgPayload,
          });
          isRevoked = true;
        }
      });
    }

    if (!isRevoked) {
      // 如果没有成功撤回, 则再在数据库中处理一下
      await ChatLog.update(
        {
          ...updatedMsgPayload,
        },
        {
          where: {
            uuid: msgUUID,
          },
        }
      );
    }

    // 通知所有用户可以看得到消息的人已撤回
    notifyUpdateMessage(msgUUID, { ...msg, ...updatedMsgPayload });
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
      // 这是一个广播的房间UUID，用于团频道不同会话复用同一个房间，防止团频道与团不同的导致房间的几何增长
      // 可以为空, 为空的话使用原来的converse_uuid作为广播
      group_uuid: { type: Sequelize.STRING },
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
      revoke: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: '消息撤回',
      },
    },
    {
      tableName: 'chat_log',
      sequelize: db,
    }
  );

  return ChatLog;
}
