import Debug from 'debug';
const debug = Debug('trpg:component:player:socketroom-manager');
import { PlayerUser } from 'packages/Player/lib/models/user';
import { TRPGApplication, Socket } from 'trpg/core';

type RoomGatherFn = (user: PlayerUser) => string[] | Promise<string[]>;
const roomGather: RoomGatherFn[] = [];

/**
 * 注册登录成功后自动加入房间的函数
 * @param gather 获取函数
 */
export function regRoomGather(gather: RoomGatherFn) {
  roomGather.push(gather);
}

/**
 * 处理自动加入房间的操作
 * @param socket 当前Socket连接
 */
export async function autoJoinSocketRoom(app: TRPGApplication, socket: Socket) {
  if (!socket) {
    debug('Add room error. not find this socket');
    return;
  }

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    debug('Add room error. not find this socket attach player');
    return;
  }

  if (!app.group) {
    debug('Add room error. need group component');
    return;
  }

  const user = await PlayerUser.findByUUID(player.uuid);
  if (!user) {
    debug('Add room error. Not found user');
    return;
  }

  const rooms: string[] = [];
  for (const fn of roomGather) {
    const list = await fn(user);
    rooms.push(...list);
  }

  await Promise.all(
    rooms.map((roomUUID) => app.player.manager.joinRoom(roomUUID, socket))
  ).catch((err) => {
    debug('auto join room error: %o', err);
  });
}

/**
 * @deprecated 已被SocketManager内置
 * 自动离开房间
 * @param socket 当前Socket连接
 */
export async function autoLeaveSockeRoom(app: TRPGApplication, socket: Socket) {
  if (!socket) {
    debug('Remove room error. not find this socket');
    app.error(new Error('Remove room error. not find this socket'));
    return;
  }

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    debug('Remove room error. not find this socket attach player');
    app.error(
      new Error('Remove room error. not find this socket attach player')
    );
    return;
  }

  if (!app.group) {
    debug('Remove room error. need group component');
    app.error(new Error('Remove room error. need group component'));
    return;
  }

  const user = await PlayerUser.findByUUID(player.uuid);
  if (!user) {
    debug('Remove room error. Not found user');
    app.error(new Error('Remove room error. Not found user'));
    return;
  }

  const rooms: string[] = [];
  for (const fn of roomGather) {
    const list = await fn(user);
    rooms.push(...list);
  }

  await Promise.all(
    rooms.map((roomUUID) => app.player.manager.leaveRoom(roomUUID, socket))
  )
    .then(() => {
      debug(`[PlayerManager] 用户[${player.uuid}]已离开所有房间`);
    })
    .catch((err) => {
      debug('auto remove room error: %o', err);
    });
}
