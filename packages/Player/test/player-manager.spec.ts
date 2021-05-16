import {
  getPlayerManager,
  PlayerManagerCls,
  PlayerMsgPayload,
  PlayerManagerPlayerMap,
  getRoomKey,
} from '../lib/managers/player-manager';
import Config from 'config';
import { RedisCache } from 'packages/Core/lib/cache';
import { sleep, generateRandomStr } from 'test/utils/utils';
import _ from 'lodash';
import { Socket } from 'trpg/core';
import { createFakeSocket } from 'test/utils/socket';

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
    playerManager = getPlayerManager({ cache });

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
    playerManager.emitMessage(testMsgPayload);

    const { payload } = await new Promise((resolve, reject) => {
      playerManager.onMessage((payload) => {
        resolve({ payload });
      });
    });

    expect(payload).toMatchObject(testMsgPayload);
  }, 10000);

  it('addPlayer should be ok', async () => {
    const socket = createFakeSocket();
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
    const socket = createFakeSocket();
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
    const socket = createFakeSocket();
    const socket2 = createFakeSocket();
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
    const socket = createFakeSocket();
    const socket2 = createFakeSocket();
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
    // 因为可能会有别的测试用例同步进行登录检测所以用toBeGreaterThanOrEqual做个最小值
    expect(await playerManager.getOnlinePlayerCount()).toBeGreaterThanOrEqual(
      0
    );
    const socket = createFakeSocket();
    await playerManager.addPlayer('test1', socket, 'web');
    expect(await playerManager.getOnlinePlayerCount()).toBeGreaterThanOrEqual(
      1
    );
    const socket2 = createFakeSocket();
    await playerManager.addPlayer('test1', socket2, 'app');
    expect(
      await playerManager.getOnlinePlayerCount(true)
    ).toBeGreaterThanOrEqual(1);
    expect(await playerManager.getOnlinePlayerCount()).toBeGreaterThanOrEqual(
      2
    );
  });

  it('tickPlayer should be ok', async () => {
    const socket = createFakeSocket();
    await playerManager.addPlayer('test1', socket, 'web');
    await playerManager.tickPlayer('test1', 'web');

    const emitFn = socket.emit as jest.Mock;
    const disconnectFn = socket.disconnect as jest.Mock;

    await sleep(500);

    expect(emitFn).toBeCalled();
    expect(emitFn).toBeCalledTimes(1);
    expect(emitFn.mock.calls[0][0]).toBe('player::tick');
    expect(emitFn.mock.calls[0][1]).toMatchObject({
      msg: '你已在其他地方登陆',
    });

    expect(disconnectFn).toBeCalled();
    expect(disconnectFn).toBeCalledTimes(1);
  });

  it('joinRoom should be ok', async () => {
    const socket = createFakeSocket();
    const roomUUID = generateRandomStr();
    await playerManager.addPlayer('test1', socket, 'web');
    await playerManager.joinRoom(roomUUID, socket);

    await sleep(500);

    expect(playerManager.findPlayer(socket).rooms.has(roomUUID)).toBe(true);
    expect(
      (await playerManager.cache.smembers(getRoomKey(roomUUID))).includes(
        socket.id
      )
    ).toBe(true);
  });

  it('leaveRoom should be ok', async () => {
    const socket = createFakeSocket();
    const roomUUID = generateRandomStr();
    await playerManager.addPlayer('test1', socket, 'web');
    await playerManager.joinRoom(roomUUID, socket);

    await sleep(200);

    await playerManager.leaveRoom(roomUUID, socket);

    await sleep(200);

    expect(playerManager.findPlayer(socket).rooms.has(roomUUID)).toBe(false);
    expect(
      (await playerManager.cache.smembers(getRoomKey(roomUUID))).includes(
        socket.id
      )
    ).toBe(false);
  });

  describe('single instance', () => {
    it('unicastSocketEvent should be ok', async () => {
      const socket1 = createFakeSocket();
      const socket2 = createFakeSocket();
      await playerManager.addPlayer('test1', socket1, 'web');
      await playerManager.addPlayer('test1', socket2, 'app');
      await playerManager.unicastSocketEvent('test1', 'testEvent', { test: 1 });

      await sleep(500);

      const emit1 = socket1.emit as jest.Mock;
      const emit2 = socket1.emit as jest.Mock;
      expect(emit1).toBeCalled();
      expect(emit1).toBeCalledTimes(1);
      expect(emit2).toBeCalled();
      expect(emit2).toBeCalledTimes(1);
      expect(emit1.mock.calls[0][0]).toBe('testEvent');
      expect(emit1.mock.calls[0][1]).toEqual({ test: 1 });
      expect(emit2.mock.calls[0][0]).toBe('testEvent');
      expect(emit2.mock.calls[0][1]).toEqual({ test: 1 });
    });

    it('roomcastSocketEvent should be ok', async () => {
      const socket1 = createFakeSocket();
      const socket2 = createFakeSocket();
      const roomUUID = 'roomUUID';
      await playerManager.addPlayer('test1', socket1, 'web');
      await playerManager.addPlayer('test2', socket2, 'web');
      await playerManager.joinRoom(roomUUID, socket1);
      await playerManager.joinRoom(roomUUID, socket2);
      await playerManager.roomcastSocketEvent(roomUUID, 'testEvent', {
        test: 1,
      });

      await sleep(500);

      const emit1 = socket1.emit as jest.Mock;
      const emit2 = socket1.emit as jest.Mock;
      expect(emit1).toBeCalled();
      expect(emit1).toBeCalledTimes(1);
      expect(emit2).toBeCalled();
      expect(emit2).toBeCalledTimes(1);
      expect(emit1.mock.calls[0][0]).toBe('testEvent');
      expect(emit1.mock.calls[0][1]).toEqual({ test: 1 });
      expect(emit2.mock.calls[0][0]).toBe('testEvent');
      expect(emit2.mock.calls[0][1]).toEqual({ test: 1 });
    });

    it('broadcastSocketEvent should be ok', async () => {
      const socket1 = createFakeSocket();
      const socket2 = createFakeSocket();
      await playerManager.addPlayer('test1', socket1, 'web');
      await playerManager.addPlayer('test2', socket2, 'web');
      await playerManager.broadcastSocketEvent('testEvent', {
        test: 1,
      });

      await sleep(500);

      const emit1 = socket1.emit as jest.Mock;
      const emit2 = socket2.emit as jest.Mock;
      expect(emit1).toBeCalled();
      expect(emit1).toBeCalledTimes(1);
      expect(emit2).toBeCalled();
      expect(emit2).toBeCalledTimes(1);
      expect(emit1.mock.calls[0][0]).toBe('testEvent');
      expect(emit1.mock.calls[0][1]).toEqual({ test: 1 });
      expect(emit2.mock.calls[0][0]).toBe('testEvent');
      expect(emit2.mock.calls[0][1]).toEqual({ test: 1 });
    });
  });
});
