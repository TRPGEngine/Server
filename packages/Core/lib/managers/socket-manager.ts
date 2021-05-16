import { EventEmitter } from 'events';
import _ from 'lodash';
import { ICache } from '../cache';
import { getLogger } from '../logger';
import { Socket } from 'socket.io';
import Debug from 'debug';
import { getMQChannel } from './mq-channel';
import { BaseMQChannel } from './mq-channel/interface';
const debug = Debug('trpg:socket-manager');
const logger = getLogger();

export interface SocketManagerOptions {
  redisUrl: string;
  cache: ICache;
}

export type SocketMsgPayloadType =
  | 'unicast' // 单播
  | 'listcast' // 列播
  | 'roomcast' // 房间广播
  | 'broadcast'; // 群体广播
export interface BaseSocketMsgPayload {
  type: SocketMsgPayloadType;
  target?: string; // 目标socketId
  targets?: string[]; // 目标socketId列表
  eventName: string;
  data: {};
}

/**
 * 抽象出的Socket管理类
 * 用于集群管理socket
 */
export abstract class SocketManager<
  SocketMsgPayload extends BaseSocketMsgPayload = BaseSocketMsgPayload
> extends EventEmitter {
  abstract getRoomKey: (key: string) => string;

  /**
   * 获取Socket额外信息的键
   * 用于为Socket绑定上一些额外的信息
   */
  getSocketExtraInfoKey = (socketId: string) =>
    `socket:manager:extra:${socketId}`;

  cache: ICache;
  channel: BaseMQChannel;

  sockets: Socket[] = []; // 记录管理的socket连接列表
  rooms: { [roomUUID: string]: string[] } = {}; // 当前实例管理的rooms列表

  constructor(public channelKey: string, options: SocketManagerOptions) {
    super();

    const redisUrl = options.redisUrl;
    if (!redisUrl) {
      throw new Error(
        '[SocketManager] require redisUrl to build pub/sub service'
      );
    }

    this.cache = options.cache;
    this.channel = getMQChannel(channelKey, redisUrl);
    this.initListener();
  }

  /**
   * 初始化消费者操作
   */
  initListener() {
    if (_.isEmpty(this.channelKey)) {
      throw new Error('[SocketManager] Channel Key is Empty!');
    }
    this.channel.consume((message) => {
      console.log('message', message);
      try {
        const payload: SocketMsgPayload = JSON.parse(message);
        this.handleMessage(payload);

        this.emit('message', payload); // 将所有接受到的payload都转发到监听
      } catch (e) {
        logger.error('receive redis sub message error with %s :%o', message, e);
      }
    });
  }

  /**
   * 处理接收到的事件
   * target为socketId 或 房间号
   */
  protected async handleMessage(payload: SocketMsgPayload): Promise<void> {
    const { type, target, targets, eventName, data } = payload;
    const waitToSendSockets: Socket[] = []; // 本地涉及到的Player列表

    const unicastHandler = (_target: string) => {
      const socket = _.find(this.sockets, ['id', _target]);
      if (!_.isNil(socket)) {
        waitToSendSockets.push(socket);
      }
    };

    if (type === 'unicast') {
      // 单播
      unicastHandler(target);
    } else if (type === 'listcast') {
      // 列播
      for (const t of targets) {
        unicastHandler(t);
      }
    } else if (type === 'roomcast') {
      // 房间广播
      const roomUUID = target;
      const allSocketIds = await this.getRoomAllSocketIds(roomUUID); // 待发送的所有socket的id
      const localSockets = this.sockets.filter((socket) =>
        allSocketIds.includes(socket.id)
      );
      waitToSendSockets.push(...localSockets);
    } else if (type === 'broadcast') {
      waitToSendSockets.push(...this.sockets);
    }

    for (const socket of waitToSendSockets) {
      // 循环发送消息
      socket.emit(eventName, data);
    }
  }

  /**
   * 增加Socket连接对象到sockets
   */
  addSocket(socket: Socket) {
    this.sockets.push(socket);

    socket.on('disconnect', () => {
      // NOTICE: 如果连接多可能会有性能问题。也许需要优化
      this.removeSocket(socket);
      debug(`[SocketManager] socket ${socket.id} 断开连接`);
    });
  }

  removeSocket(socket: Socket) {
    if (socket.connected) {
      socket.disconnect(true);
    }
    _.pull(this.sockets, socket);
  }

  /**
   * Socket额外信息
   * 用于为Socket绑定额外信息
   */
  async setSocketExtraInfo(socket: Socket, info: {}): Promise<void> {
    await this.cache.set(
      this.getSocketExtraInfoKey(socket.id),
      JSON.stringify(info)
    );
  }
  async unsetSocketExtraInfo(socket: Socket): Promise<void> {
    await this.cache.remove(this.getSocketExtraInfoKey(socket.id));
  }
  async getSocketExtraInfo(socket: Socket): Promise<any | null> {
    return this.getSocketExtraInfoBySocketId(socket.id);
  }
  async getSocketExtraInfoBySocketId(socketId: string): Promise<any | null> {
    const data = await this.cache.get(this.getSocketExtraInfoKey(socketId));
    try {
      return JSON.parse(String(data));
    } catch (err) {
      debug(err);
      return null;
    }
  }

  /**
   * 加入房间
   * 在Redis存储一个Set记录每个房间的成员
   * 值为socketId
   * @param roomUUID 房间UUID
   * @param socket socket连接
   */
  async joinRoom(roomUUID: string, socket: Socket): Promise<void> {
    const roomKey = this.getRoomKey(roomUUID);
    const socketId = socket.id;
    await this.cache.sadd(roomKey, socketId);

    this.addSocket(socket);
    if (_.isNil(this.rooms[roomUUID])) {
      this.rooms[roomUUID] = [];
    }
    this.rooms[roomUUID].push(socketId);

    socket.on('disconnect', () => {
      // NOTICE: 如果房间多可能会有性能问题。也许需要优化
      this.leaveRoom(roomUUID, socket);
      this.unsetSocketExtraInfo(socket);
      debug(`[SocketManager] socket ${socketId} 离开房间 ${roomUUID}`);
    });
  }

  /**
   * 离开房间
   * @param roomUUID 房间UUID
   * @param socket socket连接
   */
  async leaveRoom(roomUUID: string, socket: Socket): Promise<void> {
    const roomKey = this.getRoomKey(roomUUID);
    const socketId = socket.id;

    await this.cache.srem(roomKey, socketId);
    _.pull(this.rooms[roomUUID], socketId);

    logger.info(`socket [${socketId}] leave room [${roomUUID}]`);
  }

  /**
   * 清理当前实例管理的所有连接的房间
   */
  async clearRoom(): Promise<void> {
    const roomUUIDs = Object.keys(this.rooms);

    const pList = roomUUIDs.map((roomUUID) => {
      const roomKey = this.getRoomKey(roomUUID);
      const socketIds = this.rooms[roomUUID];

      return this.cache.srem(roomKey, ...socketIds);
    });

    return Promise.all(pList).then(_.noop);
  }

  /**
   * 接受到远程消息的回调
   * @param listener 监听器
   */
  onMessage(listener: (payload: SocketMsgPayload) => void) {
    this.on('message', listener);
  }

  /**
   * 向公用通道发送socket消息
   * @param payload 消息体
   */
  async emitMessage(payload: BaseSocketMsgPayload): Promise<void> {
    await this.channel.produce(JSON.stringify(payload));
  }

  /**
   * 获取房间所有的socketId列表
   * @param roomUUID 房间UUID
   */
  async getRoomAllSocketIds(roomUUID: string): Promise<string[]> {
    return (await this.cache.smembers(this.getRoomKey(roomUUID))) as string[];
  }

  /**
   * 向指定用户发送socket事件(全平台)
   * @param target 目标标识, 如何处理由handleMessage方法确定
   * @param eventName 事件名
   * @param data 数据
   */
  async unicastSocketEvent(target: string, eventName: string, data: {}) {
    const payload: BaseSocketMsgPayload = {
      type: 'unicast',
      target,
      eventName,
      data,
    };

    await this.emitMessage(payload);
  }

  /**
   * 向一批用户发送列播事件
   * @param targets 目标列表, 如何处理由handleMessage方法确定
   * @param eventName 事件名
   * @param data 数据
   */
  async listcastSocketEvent(targets: string[], eventName: string, data: {}) {
    const payload: BaseSocketMsgPayload = {
      type: 'listcast',
      targets,
      eventName,
      data,
    };

    await this.emitMessage(payload);
  }

  /**
   * 向房间中所有的用户发送socket事件
   * @param roomUUID 房间UUID
   * @param eventName 事件名
   * @param data 数据
   */
  async roomcastSocketEvent(roomUUID: string, eventName: string, data: {}) {
    const payload: BaseSocketMsgPayload = {
      type: 'roomcast',
      target: roomUUID,
      eventName,
      data,
    };

    await this.emitMessage(payload);
  }
  /**
   * 向所有连接发送广播socket事件
   * @param eventName 事件名
   * @param data 数据
   */
  async broadcastSocketEvent(eventName: string, data: {}) {
    const payload: BaseSocketMsgPayload = {
      type: 'broadcast',
      eventName,
      data,
    };

    await this.emitMessage(payload);
  }

  /**
   * 关闭所有的pubsub连接
   * 并清理房间成员
   */
  async close() {
    try {
      await Promise.all(
        this.sockets.map((s) => s.connected && s.disconnect(true))
      ).then(() => debug('所有Socket连接关闭成功'));

      await this.clearRoom().catch((e) => {
        console.error('清理Socket房间失败', e);
        throw e;
      });
      debug('清理Socket房间记录成功');

      debug('正在关闭消息队列服务..');
      this.channel.close();
    } catch (err) {
      console.error('[SocketManager] 关闭失败', err);
    }
  }
}
