import amqplib from 'amqplib';
import { BaseMQChannel } from './interface';
import Debug from 'debug';
import { getLogger } from 'log4js';
import { getGlobalApplication } from 'lib/application';
const debug = Debug('trpg:socket-manager:mq:rabbit');
const appLogger = getLogger('application');

/**
 * 使用了RabbitMQ的广播模式
 * 每一条消息都会发布给所有节点
 * https://www.rabbitmq.com/tutorials/tutorial-three-javascript.html
 */
export class RabbitMQChannel implements BaseMQChannel {
  connection: Promise<amqplib.Connection>;
  _app = getGlobalApplication();

  constructor(public topic: string, private rabbitmqUri: string) {
    this.connect();
  }

  connect() {
    this.connection = amqplib.connect(this.rabbitmqUri).then((conn) => {
      debug('[RabbitMQ]: Connected success.');

      conn.on('error', (err) => {
        this._app.error(err);

        // Try to reconnect.
        this.connect();
      });

      return conn;
    });
  }

  get exchange() {
    return `trpg.fanout.${this.topic}`;
  }

  async produce(message: string): Promise<void> {
    const connect = await this.connection;
    const ch = await connect.createChannel();

    await ch.assertExchange(this.exchange, 'fanout', { durable: false }); // 广播模式
    debug(`[RabbitMQ]: send msg: ${message}`);
    ch.publish(this.exchange, '', Buffer.from(message));
  }

  async consume(cb: (message: string) => void): Promise<void> {
    const connect = await this.connection;
    const ch = await connect.createChannel();
    await ch.assertExchange(this.exchange, 'fanout', { durable: false }); // 广播模式
    const q = await ch.assertQueue('', { exclusive: true });
    ch.bindQueue(q.queue, this.exchange, '');
    ch.consume(
      q.queue,
      (msg) => {
        const text = msg.content.toString();
        debug(`[RabbitMQ]: receive msg: ${text}`);
        cb(text);
      },
      {
        noAck: true,
      }
    );
  }

  async close(): Promise<void> {
    const connect = await this.connection;
    await connect.close();
  }
}
