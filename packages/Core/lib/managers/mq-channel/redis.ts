import { BaseMQChannel } from './interface';
import Redis from 'ioredis';
import _ from 'lodash';

export class RedisMQChannel implements BaseMQChannel {
  private pubClient: Redis.Redis;
  private subClient: Redis.Redis;
  private subscribers: Function[] = [];

  /**
   *
   * @param channelKey 会话key
   * @param redisUrl redis地址
   */
  constructor(public channelKey: string, redisUrl: string) {
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
    this.subClient.subscribe(this.channelKey);
    this.subClient.on('message', (channel, message) => {
      if (channel === this.channelKey) {
        for (const fn of this.subscribers) {
          fn(message);
        }
      }
    });
  }

  async produce(message: string): Promise<void> {
    await this.pubClient.publish(this.channelKey, message);
  }

  consume(cb: (message: string) => void): void {
    this.subscribers.push(cb);
  }

  close() {
    _.invoke(this.subClient, 'disconnect');
    _.invoke(this.pubClient, 'disconnect');
  }
}
