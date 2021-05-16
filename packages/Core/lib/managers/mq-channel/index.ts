import { getGlobalApplication } from 'lib/application';
import { BaseMQChannel } from './interface';
import { RedisMQChannel } from './redis';
import { RabbitMQChannel } from './rabbitmq';
import Debug from 'debug';
const debug = Debug('trpg:socket-manager:mq');

/**
 * 根据配置获取一个链接的实例
 */
export function getMQChannel(topic: string): BaseMQChannel {
  const app = getGlobalApplication();
  const mqType = app.get('mq.type', 'redis');

  debug('[MQ Channel]: using ' + mqType);
  if (mqType === 'redis') {
    const uri = app.get('redisUrl');
    return new RedisMQChannel(topic, uri);
  } else if (mqType === 'rabbitmq') {
    const uri = app.get('mq.rabbitmq.uri');
    return new RabbitMQChannel(topic, uri);
  } else {
    throw new Error(`Cannot find adaptor: ${mqType} in mq.type from config`);
  }
}
