import { getGlobalApplication } from 'lib/application';
import { GroupActor } from './models/group-actor';

/**
 * 通知客户端增加待审核的人物卡
 * @param groupUUID 团UUID
 * @param groupActorData 插入了actor和group信息的对象
 */
export async function notifyAddGroupActor(
  groupUUID: string,
  groupActorData: object
) {
  const trpgapp = getGlobalApplication();
  await trpgapp.player.manager.roomcastSocketEvent(
    groupUUID,
    'group::addGroupActor',
    {
      groupUUID: groupUUID,
      groupActor: groupActorData,
    }
  );
}

/**
 * 通知更新团人物信息数据
 */
export async function notifyUpdateGroupActorInfo(
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
export async function notifyUpdateGroupActor(
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
