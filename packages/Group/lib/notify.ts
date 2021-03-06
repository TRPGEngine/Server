import { getGlobalApplication } from 'lib/application';
import { GroupGroup } from './models/group';
import { GroupPanel } from './models/panel';

/**
 * 通知更新团信息
 * groupInfo可以是一部分信息
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
 * 通知更新团频道列表
 */
export async function notifyUpdateGroupChannel(group: GroupGroup) {
  const channels = await group.getChannels();

  await notifyUpdateGroupInfo(group.uuid, { channels });
}

/**
 * 通知更新团面板列表
 */
export async function notifyUpdateGroupPanel(group: GroupGroup) {
  const groupPanels = await GroupPanel.getPanelByGroup(group);

  await notifyUpdateGroupInfo(group.uuid, { panels: groupPanels });
}

/**
 * 通知用户增加团
 * @param userUUID 用户UUID
 * @param group 团信息
 */
export async function notifyUserAddGroup(userUUID: string, group: GroupGroup) {
  const trpgapp = getGlobalApplication();

  await trpgapp.player.manager.unicastSocketEvent(
    userUUID,
    'group::addGroupSuccess',
    { group }
  );
}

/**
 * 通知团用户新增成员
 * 接收是需要判断离开的用户是否为自己
 * 如果为自己则需要删除团 否则则是移除团成员列表
 * @param groupUUID 团UUID
 * @param memberUUID 成员UUID
 */
export async function notifyGroupAddMember(
  groupUUID: string,
  memberUUID: string
) {
  const trpgapp = getGlobalApplication();

  await trpgapp.player.manager.roomcastSocketEvent(
    groupUUID,
    'group::addGroupMember',
    {
      groupUUID,
      memberUUID,
    }
  );
}

/**
 * 通知用户离开团
 * 接收是需要判断离开的用户是否为自己
 * 如果为自己则需要删除团 否则则是移除团成员列表
 * @param groupUUID 团UUID
 * @param memberUUID 成员UUID
 */
export async function notifyGroupRemoveMember(
  groupUUID: string,
  memberUUID: string
) {
  const trpgapp = getGlobalApplication();

  await trpgapp.player.manager.roomcastSocketEvent(
    groupUUID,
    'group::removeGroupMember',
    {
      groupUUID,
      memberUUID,
    }
  );
}

/**
 * 通知团所有用户团被解散
 * @param groupUUID 团UUID
 */
export async function notifyGroupDismiss(groupUUID: string) {
  const trpgapp = getGlobalApplication();

  await trpgapp.player.manager.roomcastSocketEvent(
    groupUUID,
    'group::dismissGroup',
    {
      groupUUID,
    }
  );
}
