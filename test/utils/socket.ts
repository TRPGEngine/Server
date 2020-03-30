import { Socket } from 'trpg/core';
import _ from 'lodash';

/**
 * 创建一个测试用的socket
 */
export const createFakeSocket = (): Socket => {
  const emit = jest.fn() as any;
  const on = jest.fn() as any;
  const disconnect = jest.fn() as any;
  return {
    id: _.uniqueId('socket_'),
    emit,
    on,
    connected: true,
    disconnect,
  } as Socket;
};
