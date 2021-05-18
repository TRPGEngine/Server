export interface BaseMQChannel {
  /**
   * 生产一条消息
   * @param message 消息内容
   */
  produce(message: string): Promise<void>;

  /**
   * 注册消费事件的回调
   */
  consume(cb: (message: string) => void): void | Promise<void>;

  /**
   * 主动关闭MQ服务
   */
  close(): void | Promise<void>;
}
