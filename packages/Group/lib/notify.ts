import { getGlobalApplication } from 'lib/application';
import { GroupActor } from './models/actor';
import { GroupGroup } from './models/group';

/**
 * 通知更新团信息
 */
export async function notifyUpdateGroupInfo(
  groupUUID: string,
  groupInfo: Partial<GroupGroup>
) {
  const trpgapp = getGlobalApplication();
  await trpgapp.player.manager.roomcastSocketEvent(
    groupUUID,
    'group::updateGroupInfo',
    { groupUUID, groupInfo }
  );
}

/**
 * 通知更新团人物信息数据
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
      groupActorInfo: groupActor.actor_info,
    }
  );
}

/**
 * 通知更新团人物信息
 */
export async function nofifyUpdateGroupActor(
  groupUUID: string,
  groupActor: GroupActor
) {
  const trpgapp = getGlobalApplication();
  await trpgapp.player.manager.roomcastSocketEvent(
    groupUUID,
    'group::updateGroupActor',
    {
      groupUUID: groupUUID,
      groupActor: groupActor.toJSON(),
    }
  );
}
