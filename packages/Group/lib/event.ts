import Debug from 'debug';
const debug = Debug('trpg:component:group:event');
import { EventFunc } from 'trpg/core';
import _ from 'lodash';
import { PlayerUser } from 'packages/Player/lib/models/user';
import { GroupInvite } from './models/invite';
import { GroupGroup } from './models/group';
import { GroupActor } from './models/actor';
import { GroupRequest } from './models/request';
import { ChatLog } from 'packages/Chat/lib/models/log';
import { GroupDetail } from './models/detail';
import { GroupChannel } from './models/channel';
import { NoReportError } from 'lib/error';
import { notifyGroupRemoveMember, notifyGroupDismiss } from './notify';
import { GroupPanel, GroupPanelType } from './models/panel';

export const create: EventFunc<{
  name: string;
  sub_name: string;
  desc: string;
  avatar: string;
}> = async function create(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('发生异常，无法获取到用户信息，请检查您的登录状态');
  }
  const userUUID = player.uuid;

  const { name, sub_name, desc, avatar } = data;

  const group = await GroupGroup.createGroup(
    name,
    avatar,
    sub_name,
    desc,
    userUUID
  );

  return { group };
};

/**
 * 获取团信息
 */
export const getInfo: EventFunc<{
  uuid: string;
}> = async function getInfo(data, cb, db) {
  const uuid = data.uuid;
  if (!uuid) {
    throw new Error('缺少参数');
  }

  const group = await GroupGroup.findByUUID(uuid);
  if (!group) {
    throw new Error('没有找到该团');
  }
  return { group };
};

/**
 * 更新团信息
 */
export const updateInfo: EventFunc<{
  groupUUID: string;
  groupInfo: {
    avatar: string;
    name: string;
    sub_name: string;
    desc: string;
    rule: string;
  };
}> = async function updateInfo(data, cb, db) {
  const { app, socket } = this;

  if (!app.player) {
    debug('[GroupComponent] need [PlayerComponent]');
    return;
  }
  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const { groupUUID, groupInfo } = data;
  if (!groupUUID || !groupInfo) {
    throw new Error('缺少参数');
  }

  const group = await GroupGroup.updateInfo(groupUUID, groupInfo, player.uuid);

  return { group };
};

export const findGroup: EventFunc<{
  text: string;
  type: 'uuid' | 'groupname' | 'groupdesc';
}> = async function findGroup(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const { text, type } = data;
  if (!text || !type) {
    throw new Error('缺少参数');
  }

  return {
    results: await GroupGroup.searchGroup(text, type),
  };
};

export const requestJoinGroup: EventFunc<{
  group_uuid: string;
}> = async function requestJoinGroup(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户状态异常');
  }

  let from_uuid = player.uuid;
  let { group_uuid } = data;
  if (!group_uuid) {
    throw new Error('缺少必要参数');
  }

  let group = await db.models.group_group.findOne({
    where: { uuid: group_uuid },
  });
  if (!group) {
    throw new Error('该团不存在');
  }

  // 检测该用户是否已加入团
  let groupMembers = await group.getMembers();
  if (groupMembers.indexOf(from_uuid) >= 0) {
    throw new NoReportError('您已加入该团');
  }

  // 检测团加入申请是否存在
  let requestIsExist = await db.models.group_request.findOne({
    where: {
      group_uuid,
      from_uuid,
      is_agree: false,
      is_refuse: false,
    },
  });
  if (!!requestIsExist) {
    throw new Error('重复请求, 请等待管理员处理');
  }

  // 添加团邀请
  let groupRequest = await db.models.group_request.create({
    group_uuid,
    from_uuid,
    is_agree: false,
    is_refuse: false,
  });

  // 向管理员发送系统信息
  if (app.chat) {
    let managers = group.getManagerUUIDs();
    let user = await db.models.player_user.findOne({
      where: { uuid: from_uuid },
    });
    for (let muuid of managers) {
      let systemMsg = `${user.nickname || user.username} 想加入您的团 [${
        group.name
      }]`;
      app.chat.sendSystemMsg(muuid, 'groupRequest', '入团申请', systemMsg, {
        requestUUID: groupRequest.uuid,
        groupUUID: group_uuid,
        fromUUID: from_uuid,
      });
    }
  } else {
    console.warn('[GroupComponent] need [ChatComponent] to send system msg');
  }

  return { request: groupRequest };
};

/**
 * 同意入团申请
 */
export const agreeGroupRequest: EventFunc<{
  request_uuid: string;
}> = async function agreeGroupRequest(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户状态异常');
  }

  let { request_uuid } = data;
  if (!request_uuid) {
    throw new Error('缺少必要参数');
  }

  const { group } = await GroupRequest.agreeGroupRequest(
    request_uuid,
    player.uuid
  );

  const memberUUIDs = await group.getAllGroupUUIDs();
  return {
    groupUUID: group.uuid,
    members: memberUUIDs,
  };
};

/**
 * 拒绝入团申请
 */
export const refuseGroupRequest: EventFunc<{
  request_uuid: string;
}> = async function refuseGroupRequest(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户状态异常');
  }

  let { request_uuid } = data;
  if (!request_uuid) {
    throw new Error('缺少必要参数');
  }

  await GroupRequest.refuseGroupRequest(request_uuid, player.uuid);
};

export const sendGroupInvite: EventFunc<{
  group_uuid: string;
  to_uuid: string;
}> = async function sendGroupInvite(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户状态异常');
  }

  let group_uuid = data.group_uuid;
  let from_uuid = player.uuid;
  let to_uuid = data.to_uuid;
  if (from_uuid === to_uuid) {
    throw new Error('你不能邀请自己');
  }

  // TODO: 待迁移成GroupInvite.createInvites方法
  let group = await db.models.group_group.findOne({
    where: { uuid: group_uuid },
  });
  if (!group) {
    throw new Error('该团不存在');
  }

  if (!group.isManagerOrOwner(from_uuid)) {
    throw new Error('抱歉您不是该团管理员没有邀请权限');
  }

  let inviteIsExist = await db.models.group_invite.findOne({
    where: {
      group_uuid,
      from_uuid,
      to_uuid,
      is_agree: false,
      is_refuse: false,
    },
  });
  if (inviteIsExist) {
    throw new Error('重复请求');
  }

  let invite = await db.models.group_invite.create({
    group_uuid,
    from_uuid,
    to_uuid,
  });
  app.player.manager.unicastSocketEvent(to_uuid, 'group::invite', invite);

  if (app.chat && app.chat.sendMsg) {
    // 发送系统信息
    const user = await PlayerUser.findByUUID(player.uuid);
    let msg = `${user.getName()} 想邀请您加入团 ${group.name}`;
    app.chat.sendMsg('trpgsystem', to_uuid, {
      message: msg,
      type: 'card',
      data: {
        title: '入团邀请',
        type: 'groupInvite',
        content: msg,
        invite,
      },
    });
  }

  return { invite };
};

/**
 * 批量发送团邀请
 */
export const sendGroupInviteBatch: EventFunc<{
  group_uuid: string;
  target_uuids: string[];
}> = async function (data) {
  const { app, socket } = this;
  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户状态异常');
  }

  const { group_uuid, target_uuids } = data;
  const from_uuid = player.uuid;

  // 批量创建团邀请
  const invites = await GroupInvite.createInvites(
    group_uuid,
    from_uuid,
    target_uuids
  );

  // 发送通知
  for (const invite of invites) {
    const group = await GroupGroup.findOne({ where: { uuid: group_uuid } });
    if (app.chat && app.chat.sendMsg) {
      // 发送系统信息
      const user = await PlayerUser.findByUUID(player.uuid);
      let msg = `${user.getName()} 想邀请您加入团 ${group.name}`;
      app.chat.sendMsg('trpgsystem', invite.to_uuid, {
        message: msg,
        type: 'card',
        data: {
          title: '入团邀请',
          type: 'groupInvite',
          content: msg,
          invite,
        },
      });
    }
  }

  return { invites };
};

export const refuseGroupInvite: EventFunc<{
  uuid: string;
}> = async function refuseGroupInvite(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户状态异常');
  }

  let playerUUID = player.uuid;
  let inviteUUID = data.uuid;

  if (!inviteUUID) {
    throw new Error('缺少必要参数');
  }

  const invite = await GroupInvite.refuseInvite(inviteUUID, playerUUID);

  return { res: invite };
};

/**
 * 同意团邀请
 */
export const agreeGroupInvite: EventFunc<{
  uuid: string;
}> = async function agreeGroupInvite(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const playerUUID = player.uuid;
  const inviteUUID = data.uuid;

  if (!inviteUUID) {
    throw new Error('缺少必要参数');
  }

  const invite = await GroupInvite.agreeInvite(inviteUUID, playerUUID);

  return { res: invite };
};

/**
 * 获取团邀请详情内容
 */
export const getGroupInviteDetail: EventFunc<{
  // 团邀请的UUID
  uuid: string;
}> = async function (data, cb, db) {
  const { app, socket } = this;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户状态异常');
  }

  const { uuid } = data;
  const to_uuid = player.uuid;

  const invite = await GroupInvite.findOne({
    where: {
      uuid,
      to_uuid,
    },
  });

  return { invite };
};

/**
 * 获取所有未处理的团邀请列表
 * 未处理的定义: 未同意且未拒绝
 */
export const getGroupInvite: EventFunc<{}> = async function getGroupInvite(
  data,
  cb,
  db
) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户状态异常');
  }

  const uuid = player.uuid;

  const res = await GroupInvite.getAllPendingInvites(uuid);

  return { res };
};

/**
 * 获取当前用户所加入的所有团的团信息
 */
export const getGroupList: EventFunc<{}> = async function getGroupList(
  data,
  cb,
  db
) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const groups = await GroupGroup.getAllUserGroupList(player.uuid);

  return { groups };
};

/**
 * 获取团角色列表
 */
export const getGroupMembers: EventFunc<{
  groupUUID: string;
}> = async function getGroupMembers(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }
  const groupUUID = data.groupUUID;
  if (!groupUUID) {
    throw new Error('缺少必要参数');
  }

  const group = await GroupGroup.findByUUID(groupUUID);
  const members = await group.getAllGroupMember();
  return { members };
};

export const getGroupActors: EventFunc<{
  groupUUID: string;
}> = async function getGroupActors(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  let groupUUID = data.groupUUID;
  if (!groupUUID) {
    throw new Error('缺少必要参数');
  }

  const groupActors = await GroupActor.getAllGroupActors(groupUUID);
  return { actors: groupActors };
};

/**
 * 获取团所有成员选择的人物卡的uuid
 * 返回一个mapping: {成员UUID: 团人物卡UUID}
 */
export const getGroupActorMapping: EventFunc<{
  groupUUID: string;
}> = async function (data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const selfUUID = player.uuid;
  const { groupUUID } = data;

  const group = await GroupGroup.findByUUID(groupUUID);
  if (!group) {
    throw new Error('找不到团信息');
  }

  const mapping = await group.getGroupActorMapping(selfUUID);

  return { mapping };
};

/**
 * 添加一个待审核团人物
 */
export const addGroupActor: EventFunc<{
  groupUUID: string;
  actorUUID: string;
}> = async function (data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const groupUUID = data.groupUUID;
  const actorUUID = data.actorUUID;
  await GroupActor.addApprovalGroupActor(groupUUID, actorUUID, player.uuid);

  return true;
};

export const removeGroupActor: EventFunc<{
  groupUUID: string;
  groupActorUUID: string;
}> = async function (data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  let groupUUID = data.groupUUID;
  let groupActorUUID = data.groupActorUUID;
  if (!groupUUID || !groupActorUUID) {
    throw new Error('缺少必要参数');
  }

  let group = await db.models.group_group.findOne({
    where: { uuid: groupUUID },
  });
  if (!group) {
    throw new Error('找不到团');
  }

  // 检测权限
  if (!group.isManagerOrOwner(player.uuid)) {
    throw new Error('权限不足');
  }

  let isGroupActorExist = await db.models.group_actor.findOne({
    where: {
      uuid: groupActorUUID,
      groupId: group.id,
    },
  });
  if (!isGroupActorExist) {
    throw new Error('该角色不存在');
  }

  // 清空选择角色
  await db.transactionAsync(async function () {
    await db.models.group_actor.destroy({
      where: {
        uuid: groupActorUUID,
        groupId: group.id,
      },
    });

    let members = await group.getMembers();
    for (let i = 0; i < members.length; i++) {
      if (members[i].selected_group_actor_uuid === groupActorUUID) {
        members[i].selected_group_actor_uuid = null;
        await members[i].save();
      }
    }
  });

  return true;
};

/**
 * 同意入团审批
 */
export const agreeGroupActor: EventFunc<{
  groupActorUUID: string;
}> = async function agreeGroupActor(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const groupActorUUID = data.groupActorUUID;

  const groupActor = await GroupActor.agreeApprovalGroupActor(
    groupActorUUID,
    player.uuid
  );

  return { groupActor };
};

/**
 * 拒绝团角色申请
 * 逻辑就是直接删除该角色
 */
export const refuseGroupActor: EventFunc<{
  groupActorUUID: string;
}> = async function refuseGroupActor(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const groupActorUUID = data.groupActorUUID;

  await GroupActor.refuseApprovalGroupActor(groupActorUUID, player.uuid);

  return true;
};

/**
 * 更新团成员信息
 */
export const updateGroupActorInfo: EventFunc<{
  groupActorUUID: string;
  groupActorInfo: string;
}> = async function updateGroupActorInfo(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const groupActorUUID = data.groupActorUUID;
  const groupActorInfo = data.groupActorInfo;

  if (!groupActorUUID || !groupActorInfo) {
    throw new Error('缺少必要参数');
  }

  const groupActor = await GroupActor.editActorInfo(
    groupActorUUID,
    groupActorInfo,
    player.uuid
  );

  return { groupActor };
};

export const setPlayerSelectedGroupActor: EventFunc<{
  groupUUID: string;
  groupActorUUID: string;
}> = async function setPlayerSelectedGroupActor(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const userUUID = player.uuid;
  const groupUUID = data.groupUUID;
  const groupActorUUID = data.groupActorUUID; // 可以为null 即取消选择
  if (!groupUUID) {
    throw new Error('缺少必要参数');
  }

  await GroupActor.setPlayerSelectedGroupActor(
    groupUUID,
    groupActorUUID,
    userUUID,
    userUUID
  );

  return {
    data: { groupUUID, groupActorUUID },
  };
};

/**
 * 获取团指定用户当前团角色
 */
export const getPlayerSelectedGroupActor: EventFunc<{
  groupUUID: string;
  groupMemberUUID: string;
}> = async function getPlayerSelectedGroupActor(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const groupUUID = data.groupUUID;
  const groupMemberUUID = data.groupMemberUUID;
  if (!groupUUID || !groupMemberUUID) {
    throw new Error('缺少必要参数');
  }

  const group = await db.models.group_group.findOne({
    where: { uuid: groupUUID },
  });
  if (!group) {
    throw new Error('找不到团');
  }

  const selectedGroupActorUUID = await GroupActor.getSelectedGroupActorUUID(
    group,
    groupMemberUUID
  );

  return {
    playerSelectedGroupActor: {
      groupMemberUUID,
      selectedGroupActorUUID,
    },
  };
};

// 退出团
export const quitGroup: EventFunc<{
  groupUUID: string;
}> = async function quitGroup(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }
  const groupUUID = data.groupUUID;
  if (!groupUUID) {
    throw new Error('缺少必要参数');
  }

  await GroupGroup.removeGroupMember(groupUUID, player.uuid).then(
    ({ user, group }) => {
      // 系统通知所有团管理员
      const managers_uuid = group.getManagerUUIDs();
      const systemMsg = `用户 ${user.getName()} 退出了团 [${group.name}]`;
      managers_uuid.forEach((uuid) => {
        if (uuid !== user.uuid) {
          ChatLog.sendSimpleSystemMsg(uuid, null, systemMsg);
        }
      });
    }
  );

  return true;
};

// 解散团
export const dismissGroup: EventFunc<{
  groupUUID: string;
}> = async function dismissGroup(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }
  const groupUUID = data.groupUUID;
  if (!groupUUID) {
    throw new Error('缺少必要参数');
  }

  const group: GroupGroup = await GroupGroup.findByUUID(groupUUID);
  if (!group) {
    throw new Error('找不到团');
  }
  if (group.owner_uuid !== player.uuid) {
    throw new Error('你没有该权限');
  }

  // 系统通知
  const members: PlayerUser[] = await group.getMembers();
  const systemMsg = `您所在的团 ${group.name} 解散了, ${
    members.length - 1
  } 只小鸽子无家可归`;
  members.forEach((member) => {
    let uuid = member.uuid;
    if (uuid !== group.owner_uuid) {
      app.chat.sendSystemSimpleMsg(uuid, systemMsg);
    }
  });

  await group.destroy();

  // 通知团成员移除角色
  notifyGroupDismiss(groupUUID);

  // TODO: 解散socket房间

  return true;
};

/**
 * 将成员踢出
 */
export const tickMember: EventFunc<{
  groupUUID: string;
  memberUUID: string;
}> = async function (data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }
  const groupUUID = data.groupUUID;
  const memberUUID = data.memberUUID;
  if (!groupUUID || !memberUUID) {
    throw new Error('缺少必要参数');
  }

  await GroupGroup.tickMember(groupUUID, memberUUID, player.uuid);

  return true;
};

/**
 * 将普通用户提升为管理员
 */
export const setMemberToManager: EventFunc<{
  groupUUID: string;
  memberUUID: string;
}> = async function setMemberToManager(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }
  const groupUUID = data.groupUUID;
  const memberUUID = data.memberUUID;
  if (_.isNil(groupUUID) || _.isNil(memberUUID)) {
    throw new Error('缺少必要参数');
  }

  const group = await GroupGroup.setMemberToManager(
    groupUUID,
    memberUUID,
    player.uuid
  );
  return { group };
};

// 获取团状态
export const getGroupStatus: EventFunc<{
  groupUUID: string;
}> = async function getGroupStatus(data, cb) {
  const app = this.app;
  const socket = this.socket;

  let { groupUUID } = data;
  if (!groupUUID) {
    throw new Error('缺少必要参数');
  }
  let groupStatus = await app.cache.get(`component:group:${groupUUID}:status`);
  return { status: Boolean(groupStatus) };
};

// 设置团状态： 开团、闭团
export const setGroupStatus: EventFunc<{
  groupUUID: string;
  groupStatus: boolean;
}> = async function setGroupStatus(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }
  const uuid = player.uuid;
  let { groupUUID, groupStatus } = data;
  groupStatus = Boolean(groupStatus);
  if (!groupUUID || groupStatus === undefined) {
    throw new Error('缺少必要参数');
  }

  const group = await db.models.group_group.findOne({
    where: { uuid: groupUUID },
  });
  if (!group) {
    throw new Error('没有找到该团');
  }
  if (!group.isManagerOrOwner(uuid)) {
    throw new Error('没有修改团状态的权限');
  }

  app.cache.set(`group:${groupUUID}:status`, groupStatus);
  // 通知所有团成员更新团状态
  socket.broadcast.to(groupUUID).emit('group::updateGroupStatus', {
    groupUUID,
    groupStatus,
  });
  return true;
};

/**
 * 保存团详情
 */
export const saveGroupDetail: EventFunc<{
  groupUUID: string;
  detailData: {};
}> = async function (data, cb, db) {
  const { app, socket } = this;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const { groupUUID, detailData } = data;

  await GroupDetail.saveGroupDetail(groupUUID, player.uuid, detailData);

  return true;
};

export const createGroupPanel: EventFunc<{
  groupUUID: string;
  name: string;
  type: GroupPanelType;
  extra: object;
}> = async function (data) {
  const { app, socket } = this;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const { groupUUID, name, type, extra } = data;
  if (_.isNil(groupUUID) || _.isNil(name) || _.isNil(type)) {
    throw new Error('缺少必要参数');
  }

  const { groupPanel, other } = await GroupPanel.createPanel(
    name,
    type,
    extra,
    groupUUID,
    player.uuid
  );

  return { ...other, groupPanel };
};

/**
 * 获取Group的初始化信息
 */
export const getGroupInitData: EventFunc<{
  groupUUID: string;
}> = async function (data, cb, db) {
  const { app, socket } = this;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }
  const groupUUID = data.groupUUID;
  if (!groupUUID) {
    throw new Error('缺少必要参数');
  }

  // 获取团成员
  const group = await GroupGroup.findByUUID(groupUUID);
  const members: PlayerUser[] = await group.getAllGroupMember();

  // 获取团人物
  const groupActors: GroupActor[] = await group.getGroupActors();

  // 获取团选择人物的Mapping
  const groupActorsMapping = await group.getGroupActorMapping(player.uuid);

  return { members, groupActors, groupActorsMapping };
};
