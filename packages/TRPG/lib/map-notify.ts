import { getGlobalApplication } from 'lib/application';
import _ from 'lodash';

function getMapManager() {
  return getGlobalApplication().trpg.mapManager;
}

type UpdateType = 'add' | 'update' | 'remove';
export async function notifyUpdateToken(
  mapUUID: string,
  type: UpdateType,
  payload: {}
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
