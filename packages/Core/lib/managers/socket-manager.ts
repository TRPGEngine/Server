import { EventEmitter } from 'events';
import Redis from 'ioredis';
import _ from 'lodash';
import { ICache } from '../cache';
import { getLogger } from '../logger';
import { Socket } from 'socket.io';
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

  cache: ICache;
  pubClient: Redis.Redis;
  subClient: Redis.Redis;

  constructor(public channelKey: string, options: SocketManagerOptions) {
    super();

    const redisUrl = options.redisUrl;
    if (!redisUrl) {
      throw new Error(
        '[SocketManager] require redisUrl to build pub/sub service'
      );
    }

    this.cache = options.cache;
    this.pubClient = new Redis(redisUrl);
    this.subClient = new Redis(redisUrl);

    this.initListener();
  }

  /**
   * 初始化监听器
   * 通过redis作为一个MQ系统来获取分布式通信
   */
  initListener() {
    if (_.isEmpty(this.channelKey)) {
      throw new Error('[SocketManager] Channel Key is Empty!');
    }
    console.log('this.channelKey', this.channelKey);
    this.subClient.subscribe(this.channelKey);
    this.subClient.on('message', (channel, message) => {
      console.log('msss', channel, message);
      if (channel === this.channelKey) {
        try {
          const payload: SocketMsgPayload = JSON.parse(message);
          this.handleMessage(payload);

          this.emit('message', payload); // 将所有接受到的payload都转发到监听
        } catch (e) {
          logger.error(
            'receive redis sub message error with %s :%o',
            message,
            e
          );
        }
      }
    });
  }

  /**
   * 处理接收到的事件
   */
  protected abstract handleMessage(payload: SocketMsgPayload): Promise<void>;

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
    await this.pubClient.publish(this.channelKey, JSON.stringify(payload));
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
   */
  async close() {
    try {
      _.invoke(this.pubClient, 'disconnect');
      _.invoke(this.subClient, 'disconnect');
    } catch (err) {
      console.error('[PlayerManager] 关闭失败', err);
    }
  }
}
