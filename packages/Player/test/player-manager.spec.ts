import {
  getPlayerManager,
  PlayerManagerCls,
  PlayerMsgPayload,
} from '../lib/managers/player-manager';
import Config from 'config';
import { RedisCache } from 'packages/Core/lib/cache';
import { sleep } from 'test/utils/utils';
import _ from 'lodash';
import { Socket } from 'trpg/core';

const redisUrl = Config.get<string>('redisUrl');
const getFakeSocket = (): Socket => {
  const emit = jest.fn() as any;
  return {
    id: _.uniqueId('socket_'),
    emit,
  } as Socket;
};

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

  afterAll(async () => {
    await playerManager.close();
    cache.close();
  });

  it('onMessage should be ok', async () => {
    const testMsgPayload: PlayerMsgPayload = {
      uuid: 'test-uuid-key',
      platform: 'web',
    } as any;
    playerManager.emitPlayerMsg(testMsgPayload);

    const { payload } = await new Promise((resolve, reject) => {
      playerManager.onMessage((payload) => {
        resolve({ payload });
      });
    });

    expect(payload).toMatchObject(testMsgPayload);
  }, 10000);

  it('addPlayer should be ok', async () => {
    const socket = getFakeSocket();
    const isSuccess = await playerManager.addPlayer('testUUID', socket, 'web');

    expect(isSuccess).toBe(true);
    expect(playerManager.players).toMatchObject({
      [socket.id]: {
        uuid: 'testUUID',
        platform: 'web',
        socket,
        rooms: new Set(),
      },
    });
  });

  describe('single instance', () => {});
});
