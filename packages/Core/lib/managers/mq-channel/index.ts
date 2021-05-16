import { getGlobalApplication } from 'lib/application';
import { BaseMQChannel } from './interface';
import { RedisMQChannel } from './redis';

export function getMQChannel(topic: string, uri: string): BaseMQChannel {
  const app = getGlobalApplication();
  const mqType = app.get('mq.type', 'redis');
  if (mqType === 'redis') {
    return new RedisMQChannel(topic, uri);
  } else {
    throw new Error(`Cannot find adaptor: ${mqType} in mq.type from config`);
  }
}
