import {
  getPlayerManager,
  PlayerManagerCls,
  PlayerMsgPayload,
} from '../lib/managers/player-manager';
import Config from 'config';
import { RedisCache } from 'packages/Core/lib/cache';
import { sleep } from 'test/utils/utils';

const redisUrl = Config.get<string>('redisUrl');

describe('player-manager class test', () => {
  let cache: RedisCache;
  let playerManager: PlayerManagerCls;

  if (!redisUrl) {
    console.warn('this test case require redis url');
    return;
  }

  beforeAll(() => {
    cache = new RedisCache({ url: redisUrl });
    playerManager = getPlayerManager({ redisUrl, cache });

    return sleep(5000);
  }, 10000);

  afterAll(() => {
    cache.close();
    playerManager.close();
  });

  it('pubsub should be ok', async () => {
    const testMsgPayload: PlayerMsgPayload = {
      uuid: 'test-uuid-key',
      platform: 'web',
    };
    const testPlayerMap = {
      'web#test-uuid-key': 'socket test string' as any,
    };
    playerManager.players = testPlayerMap;
    playerManager.emitPlayerMsg(testMsgPayload);

    const { payload, socket } = await new Promise((resolve, reject) => {
      playerManager.onMessage((payload, socket) => {
        resolve({ payload, socket });
      });
    });

    expect(payload).toMatchObject(testMsgPayload);
    expect(socket).toBe('socket test string');
  }, 10000);
});
