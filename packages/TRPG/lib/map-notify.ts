import { getGlobalApplication } from 'lib/application';
import _ from 'lodash';
import { UpdateTokenPayloadMap } from '../types/map';

function getMapManager() {
  return getGlobalApplication().trpg.mapManager;
}

type UpdateType = 'add' | 'update' | 'remove';
export async function notifyUpdateToken(
  mapUUID: string,
  type: UpdateType,
  payload: UpdateTokenPayloadMap[UpdateType]
) {
  const mapManager = getMapManager();
  if (_.isNil(mapManager)) {
    return;
  }
  await mapManager.roomcastSocketEvent(mapUUID, 'trpg::updateMapToken', {
    mapUUID,
    type,
    payload,
  });
}

/**
 * 通知添加团地图
 */
export async function notifyAddGroupMap(
  groupUUID: string,
  mapUUID: string,
  mapName: string
) {
  const trpgapp = getGlobalApplication();
  await trpgapp.player.manager.roomcastSocketEvent(
    groupUUID,
    'trpg::addGroupMap',
    { groupUUID, mapUUID, mapName }
  );
}

/**
 * 通知更新地图连接列表
 */
export async function notifyUpdateOnlineSocketList(
  mapUUID: string,
  socketIds: string[]
) {
  const trpgapp = getGlobalApplication();
  await trpgapp.player.manager.roomcastSocketEvent(
    mapUUID,
    'trpg::updateMapConnects',
    { mapUUID, socketIds }
  );
}
