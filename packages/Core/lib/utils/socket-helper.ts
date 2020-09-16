import { Socket } from 'socket.io';
import _ from 'lodash';

/**
 * 获取socket连接的ip地址
 * @param socket SocketIO的连接
 */
export function getSocketIp(socket: Socket): string | undefined {
  return (
    _.get(socket, 'handshake.headers.x-real-ip') ||
    _.get(socket, 'handshake.address')
  );
}
