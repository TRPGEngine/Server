import {
  getPlayerManager,
  PlayerManagerCls,
  PlayerMsgPayload,
  PlayerManagerPlayerMap,
} from '../lib/managers/player-manager';
import Config from 'config';
import { RedisCache } from 'packages/Core/lib/cache';
import { sleep } from 'test/utils/utils';
import _ from 'lodash';
import { Socket } from 'trpg/core';

const redisUrl = Config.get<string>('redisUrl');
const getFakeSocket = (): Socket => {
  const emit = jest.fn() as any;
  const disconnect = jest.fn() as any;
  return {
    id: _.uniqueId('socket_'),
    emit,
    connected: true,
    disconnect,
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

  afterEach(async () => {
    // 每次测试用例结束后清除players列表
    for (const player of Object.values(playerManager.players)) {
      await playerManager.removePlayer(player.uuid, player.platform);
    }
  });

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

  it('removePlayer should be ok', async () => {
    const socket = getFakeSocket();
    playerManager.players = {
      [socket.id]: {
        uuid: 'testUUID',
        platform: 'web',
        socket,
        rooms: new Set(),
      },
    };

    await playerManager.removePlayer('testUUID', 'web');
    expect(_.isEmpty(playerManager.players)).toBe(true);
  });

  it('findPlayerWithUUID', async () => {
    const socket = getFakeSocket();
    const socket2 = getFakeSocket();
    const players: PlayerManagerPlayerMap = {
      [socket.id]: {
        uuid: 'testUUID',
        platform: 'web',
        socket,
        rooms: new Set(),
      },
      [socket2.id]: {
        uuid: 'testUUID',
        platform: 'app',
        socket: socket2,
        rooms: new Set(),
      },
    };
    playerManager.players = players;

    expect(playerManager.findPlayerWithUUID('testUUID')).toEqual(
      Object.values(players)
    );
    expect(playerManager.findPlayerWithUUID('testUUID2')).toEqual([]);
  });

  it('findPlayerWithUUIDPlatform', async () => {
    const socket = getFakeSocket();
    const socket2 = getFakeSocket();
    const players: PlayerManagerPlayerMap = {
      [socket.id]: {
        uuid: 'testUUID',
        platform: 'web',
        socket,
        rooms: new Set(),
      },
      [socket2.id]: {
        uuid: 'testUUID',
        platform: 'app',
        socket: socket2,
        rooms: new Set(),
      },
    };
    playerManager.players = players;

    expect(playerManager.findPlayerWithUUIDPlatform('testUUID', 'web')).toEqual(
      Object.values(players)[0]
    );
    expect(
      playerManager.findPlayerWithUUIDPlatform('testUUID2', 'web')
    ).toEqual(undefined);
  });

  it('getOnlinePlayerCount should be ok', async () => {
    expect(await playerManager.getOnlinePlayerCount()).toBe(0);
    const socket = getFakeSocket();
    await playerManager.addPlayer('test1', socket, 'web');
    expect(await playerManager.getOnlinePlayerCount()).toBe(1);
    const socket2 = getFakeSocket();
    await playerManager.addPlayer('test1', socket2, 'app');
    expect(await playerManager.getOnlinePlayerCount(true)).toBe(1);
    expect(await playerManager.getOnlinePlayerCount()).toBe(2);
  });

  it('tickPlayer should be ok', async () => {
    const socket = getFakeSocket();
    await playerManager.addPlayer('test1', socket, 'web');
    await playerManager.tickPlayer('test1', 'web');

    const emitFn = socket.emit as jest.Mock;
    const disconnectFn = socket.disconnect as jest.Mock;

    expect(emitFn).toBeCalled();
    expect(emitFn).toBeCalledTimes(1);
    expect(emitFn.mock.calls[0][0]).toBe('player::tick');
    expect(emitFn.mock.calls[0][1]).toMatchObject({
      msg: '你已在其他地方登陆',
    });

    expect(disconnectFn).toBeCalled();
    expect(disconnectFn).toBeCalledTimes(1);
  });

  describe('single instance', () => {});
});
