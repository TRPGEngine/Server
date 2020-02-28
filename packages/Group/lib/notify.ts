import { getGlobalApplication } from 'lib/application';
import { GroupActor } from './models/actor';

/**
 * 通知更新团信息
 */
export async function notifyUpdateGroupInfo(
  groupUUID: string,
  groupInfo: object
) {
  const trpgapp = getGlobalApplication();
  await trpgapp.player.manager.roomcastSocketEvent(
    groupUUID,
    'group::updateGroupInfo',
    { groupUUID, groupInfo }
  );
}

/**
 * 通知更新团人物信息
 */
export async function nofifyUpdateGroupActorInfo(
  groupUUID: string,
  groupActor: GroupActor
) {
  const trpgapp = getGlobalApplication();
  await trpgapp.player.manager.roomcastSocketEvent(
    groupUUID,
    'group::updateGroupActorInfo',
    {
      groupUUID: groupUUID,
      groupActorUUID: groupActor.uuid,
      groupActorInfo: groupActor.toJSON(),
    }
  );
}
