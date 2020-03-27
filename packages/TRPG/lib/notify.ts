import { getGlobalApplication } from 'lib/application';
import { MapTokenModifyType, MapTokenModifyPayload } from './models/game-map';

/**
 * 通知更新团信息
 */
export async function notifyModifyToken(
  groupUUID: string,
  mapUUID: string,
  modifyType: MapTokenModifyType,
  modifyPayload: MapTokenModifyPayload
) {
  const trpgapp = getGlobalApplication();
  await trpgapp.player.manager.roomcastSocketEvent(
    groupUUID,
    'trpg::updateMapToken',
    { groupUUID, mapUUID, modifyType, modifyPayload }
  );
}
