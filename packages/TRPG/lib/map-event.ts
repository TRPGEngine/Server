import { EventFunc } from 'trpg/core';
import _ from 'lodash';
import { TRPGGameMap } from './models/game-map';

export const joinMapRoom: EventFunc<{
  mapUUID: string;
}> = async function joinMapRoom(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const { mapUUID } = data;
  if (_.isNil(mapUUID)) {
    throw new Error('缺少必要字段');
  }

  await app.trpg.mapManager.joinRoom(mapUUID, socket);

  return true;
};
