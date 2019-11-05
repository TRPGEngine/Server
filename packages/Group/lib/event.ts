import Debug from 'debug';
const debug = Debug('trpg:component:group:event');
import uuid from 'uuid/v4';
import { EventFunc } from 'trpg/core';
import _ from 'lodash';
import { PlayerUser } from 'packages/Player/lib/models/user';
import { GroupInvite } from './models/invite';
import { GroupGroup } from './models/group';

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
    throw '发生异常，无法获取到用户信息，请检查您的登录状态';
  }
  const userUUID = player.uuid;

  const { name, sub_name, desc, avatar } = data;
  if (!name) {
    throw '缺少团名';
  }

  let isExist = await db.models.group_group.findOne({
    where: { name },
  });
  if (!!isExist) {
    throw '该团名已存在';
  }

  const user = await PlayerUser.findByUUID(userUUID);
  const group = await db.models.group_group.create({
    type: 'group',
    name,
    sub_name,
    desc,
    avatar,
    creator_uuid: userUUID,
    owner_uuid: userUUID,
    managers_uuid: [],
    maps_uuid: [],
  });

  await group.setOwner(user);
  await app.group.addGroupMemberAsync(group.uuid, userUUID);

  await app.player.manager.joinRoom(group.uuid, socket); // 加入房间

  return { group };
};

export const getInfo: EventFunc<{
  uuid: string;
}> = async function getInfo(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  let uuid = data.uuid;
  if (!uuid) {
    throw '缺少参数';
  }

  let group = await db.models.group_group.findOne({
    where: { uuid },
  });
  if (!group) {
    throw '没有找到该团';
  }
  return { group };
};

export const updateInfo: EventFunc<{
  groupUUID: string;
  groupInfo: {
    avatar: string;
    name: string;
    sub_name: string;
    desc: string;
  };
}> = async function updateInfo(data, cb, db) {
  let { app, socket } = this;

  if (!app.player) {
    debug('[GroupComponent] need [PlayerComponent]');
    return;
  }
  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '用户不存在，请检查登录状态';
  }

  let { groupUUID, groupInfo } = data;
  if (!groupUUID || !groupInfo) {
    throw '缺少参数';
  }

  let group = await db.models.group_group.findOne({
    where: { uuid: groupUUID },
  });
  if (!group) {
    throw '找不到团';
  }
  if (!group.isManagerOrOwner(player.uuid)) {
    throw '没有修改权限';
  }

  // IDEA: 为防止意外暂时只允许修改下列属性
  let info = {
    avatar: groupInfo.avatar,
    name: groupInfo.name,
    sub_name: groupInfo.sub_name,
    desc: groupInfo.desc,
  };
  for (let key in info) {
    if (info[key] !== undefined) {
      group[key] = info[key];
    }
  }

  await group.save();
  return { group };
};

export const findGroup: EventFunc<{
  text: string;
  type: 'uuid' | 'groupname' | 'groupdesc';
}> = async function findGroup(data, cb, db) {
  const app = this.app;
  const socket = this.socket;
  const Op = app.storage.Op;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '用户不存在，请检查登录状态';
  }

  const { text, type } = data;
  if (!text || !type) {
    throw '缺少参数';
  }

  let results = [];
  if (type === 'uuid') {
    results = await db.models.group_group.findAll({
      where: { uuid: text },
      limit: 10,
    });
  } else if (type === 'groupname') {
    results = await db.models.group_group.findAll({
      where: {
        name: {
          [Op.like]: `%${text}%`,
        },
      },
      limit: 10,
    });
  } else if (type === 'groupdesc') {
    results = await db.models.group_group.findAll({
      where: {
        desc: {
          [Op.like]: `%${text}%`,
        },
      },
      limit: 10,
    });
  }

  return { results };
};

export const requestJoinGroup: EventFunc<{
  group_uuid: string;
}> = async function requestJoinGroup(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '用户状态异常';
  }

  let from_uuid = player.uuid;
  let { group_uuid } = data;
  if (!group_uuid) {
    throw '缺少必要参数';
  }

  let group = await db.models.group_group.findOne({
    where: { uuid: group_uuid },
  });
  if (!group) {
    throw '该团不存在';
  }

  // 检测该用户是否已加入团
  let groupMembers = await group.getMembers();
  if (groupMembers.indexOf(from_uuid) >= 0) {
    throw '您已加入该团';
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
    throw '重复请求';
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

export const agreeGroupRequest: EventFunc<{
  request_uuid: string;
}> = async function agreeGroupRequest(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '用户状态异常';
  }

  let { request_uuid } = data;
  if (!request_uuid) {
    throw '缺少必要参数';
  }

  let request = await db.models.group_request.findOne({
    where: { uuid: request_uuid },
  });
  if (!request) {
    throw '找不到该入团申请';
  }
  if (request.is_agree === true) {
    throw '已同意该请求';
  }

  let group_uuid = request.group_uuid;
  let group = await db.models.group_group.findOne({
    where: { uuid: group_uuid },
  });
  if (!group) {
    throw '找不到该团';
  }

  await request.agreeAsync();

  // 发送入团成功消息
  const user = await PlayerUser.findByUUID(player.uuid);
  let systemMsg = `管理员 ${user.getName()} 已同意您加入团 [${
    group.name
  }] ,和大家打个招呼吧!`;
  app.chat.sendSystemMsg(
    request.from_uuid,
    'groupRequestSuccess',
    '入团成功',
    systemMsg,
    {
      groupUUID: group_uuid,
    }
  );
  await app.group.addGroupMemberAsync(group_uuid, request.from_uuid);

  let members = await group.getMembers();
  let members_uuid = members.map((i) => i.uuid);
  return {
    groupUUID: group.uuid,
    members: members_uuid,
  };
};

export const refuseGroupRequest: EventFunc<{
  request_uuid: string;
}> = async function refuseGroupRequest(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '用户状态异常';
  }

  let { request_uuid } = data;
  if (!request_uuid) {
    throw '缺少必要参数';
  }

  let request = await db.models.group_request.findOne({
    where: { uuid: request_uuid },
  });
  if (!request) {
    throw '找不到该入团申请';
  }
  if (request.is_agree === true) {
    return true;
  }

  let group_uuid = request.group_uuid;
  let group = await db.models.group_group.findOne({
    where: { uuid: group_uuid },
  });
  if (!group) {
    throw '找不到该团';
  }

  await request.refuseAsync();
  cb({ result: true });

  const user = await PlayerUser.findByUUID(player.uuid);
  let systemMsg = `管理员 ${user.getName()} 已拒绝您加入团 ${
    group.name
  }, 请等待其他管理员的验证。`;
  app.chat.sendSystemMsg(
    request.from_uuid,
    'groupRequestFail',
    '入团被拒',
    systemMsg,
    { groupUUID: group_uuid }
  );
};

export const sendGroupInvite: EventFunc<{
  group_uuid: string;
  to_uuid: string;
}> = async function sendGroupInvite(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '用户状态异常';
  }

  let group_uuid = data.group_uuid;
  let from_uuid = player.uuid;
  let to_uuid = data.to_uuid;
  if (from_uuid === to_uuid) {
    throw '你不能邀请自己';
  }

  // TODO: 待迁移成GroupInvite.createInvites方法
  let group = await db.models.group_group.findOne({
    where: { uuid: group_uuid },
  });
  if (!group) {
    throw '该团不存在';
  }

  if (!group.isManagerOrOwner(from_uuid)) {
    throw '抱歉您不是该团管理员没有邀请权限';
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
    throw '重复请求';
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
}> = async function(data) {
  const { app, socket } = this;
  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '用户状态异常';
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
    throw '用户状态异常';
  }

  let playerUUID = player.uuid;
  let inviteUUID = data.uuid;

  if (!inviteUUID) {
    throw '缺少必要参数';
  }

  let invite = await db.models.group_invite.findOne({
    where: {
      uuid: inviteUUID,
      to_uuid: playerUUID,
    },
  });

  if (!invite) {
    throw '拒绝失败: 该请求不存在';
  }

  invite.is_refuse = true;
  await invite.save();
  return { res: invite };
};

export const agreeGroupInvite: EventFunc<{
  uuid: string;
}> = async function agreeGroupInvite(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '用户不存在，请检查登录状态';
  }

  let playerUUID = player.uuid;
  let inviteUUID = data.uuid;

  if (!inviteUUID) {
    throw '缺少必要参数';
  }

  let invite = await db.models.group_invite.findOne({
    where: {
      uuid: inviteUUID,
      to_uuid: playerUUID,
    },
  });
  invite.is_agree = true;
  let groupUUID = invite.group_uuid;
  let group = await db.models.group_group.findOne({
    where: { uuid: groupUUID },
  });
  if (!group) {
    throw '该团不存在';
  }

  await db.transactionAsync(async () => {
    await app.group.addGroupMemberAsync(groupUUID, playerUUID);
    invite = await invite.save();
    invite.group = group;
  });

  return { res: invite };
};

/**
 * 获取团邀请详情内容
 */
export const getGroupInviteDetail: EventFunc<{
  // 团邀请的UUID
  uuid: string;
}> = async function getGroupInviteDetail(data, cb, db) {
  const { app, socket } = this;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '用户状态异常';
  }

  const { uuid } = data;
  const invite = await GroupInvite.findOne({
    where: {
      uuid,
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
    throw '用户状态异常';
  }

  let uuid = player.uuid;
  let res = await db.models.group_invite.findAll({
    where: {
      to_uuid: uuid,
      is_agree: false,
      is_refuse: false,
    },
  });

  return { res };
};

export const getGroupList: EventFunc<{}> = async function getGroupList(
  data,
  cb,
  db
) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '用户不存在，请检查登录状态';
  }

  let user = await db.models.player_user.findOne({
    where: { uuid: player.uuid },
  });
  let groups = await user.getGroups();
  return { groups };
};

// TODO: selected_actor_uuid相关可能会有问题。需要处理
export const getGroupMembers: EventFunc<{
  groupUUID: string;
}> = async function getGroupMembers(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '用户不存在，请检查登录状态';
  }
  let groupUUID = data.groupUUID;
  if (!groupUUID) {
    throw '缺少必要参数';
  }

  let group = await db.models.group_group.findOne({
    where: { uuid: groupUUID },
  });
  let members = await group.getMembers();
  members = members.map((i) =>
    Object.assign({}, i.getInfo(), {
      selected_actor_uuid: i.group_group_members.selected_group_actor_uuid,
    })
  );
  return { members };
};

export const getGroupActors: EventFunc<{
  groupUUID: string;
}> = async function getGroupActors(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '用户不存在，请检查登录状态';
  }

  let groupUUID = data.groupUUID;
  if (!groupUUID) {
    throw '缺少必要参数';
  }

  let group = await db.models.group_group.findOne({
    where: { uuid: groupUUID },
  });
  if (!group) {
    throw '找不到团信息';
  }
  let groupActors = await group.getGroupActors();
  let res = [];
  for (let ga of groupActors) {
    res.push(await ga.getObjectAsync());
  }
  return { actors: res };
};

/**
 * 获取团所有成员选择的人物卡的uuid
 * 返回一个mapping: {成员UUID: 团人物卡UUID}
 */
export const getGroupActorMapping: EventFunc<{
  groupUUID: string;
}> = async function getGroupActorMapping(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '用户不存在，请检查登录状态';
  }

  const selfUUID = player.uuid;
  const { groupUUID } = data;

  const group = await (db.models.group_group as any).findOne({
    where: { uuid: groupUUID },
  });
  if (!group) {
    throw '找不到团信息';
  }

  const members = await group.getMembers();
  const mapping = _.fromPairs(
    members.map((member) => {
      const userUUID = _.get(member, 'uuid');
      const groupActorUUID = _.get(
        member,
        'group_group_members.selected_group_actor_uuid'
      );

      if (_.isNil(groupActorUUID)) {
        return [];
      }

      return [userUUID, groupActorUUID];
    })
  );
  if (mapping[selfUUID]) {
    mapping['self'] = mapping[selfUUID];
  }

  return { mapping };
};

/**
 * 添加团人物
 */
export const addGroupActor: EventFunc<{
  groupUUID: string;
  actorUUID: string;
}> = async function addGroupActor(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '用户不存在，请检查登录状态';
  }

  let groupUUID = data.groupUUID;
  let actorUUID = data.actorUUID;
  if (!groupUUID || !actorUUID) {
    throw '缺少必要参数';
  }
  let group = await db.models.group_group.findOne({
    where: { uuid: groupUUID },
  });
  if (!group) {
    throw '找不到团';
  }
  let actor = await db.models.actor_actor.findOne({
    where: { uuid: actorUUID },
  });
  if (!actor) {
    throw '找不到该角色';
  }
  let isGroupActorExist = await db.models.group_actor.findOne({
    where: { actor_uuid: actor.uuid, groupId: group.id },
  });
  if (isGroupActorExist) {
    throw '该角色已存在';
  }

  const user = await PlayerUser.findByUUID(player.uuid);

  let groupActor;
  await db.transactionAsync(async () => {
    groupActor = await db.models.group_actor.create({
      name: actor.name,
      desc: actor.desc,
      actor_uuid: actorUUID,
      actor_info: {},
      avatar: actor.avatar,
      passed: false,
      ownerId: user.id,
    });
    groupActor = await groupActor.setActor(actor);
    groupActor = await groupActor.setGroup(group);

    _.set(groupActor, 'dataValues.actor', actor);
    _.set(groupActor, 'dataValues.group', group);
  });

  return { groupActor };
};

export const removeGroupActor: EventFunc<{
  groupUUID: string;
  groupActorUUID: string;
}> = async function(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '用户不存在，请检查登录状态';
  }

  let groupUUID = data.groupUUID;
  let groupActorUUID = data.groupActorUUID;
  if (!groupUUID || !groupActorUUID) {
    throw '缺少必要参数';
  }

  let group = await db.models.group_group.findOne({
    where: { uuid: groupUUID },
  });
  if (!group) {
    throw '找不到团';
  }

  // 检测权限
  if (!group.isManagerOrOwner(player.uuid)) {
    throw '权限不足';
  }

  let isGroupActorExist = await db.models.group_actor.findOne({
    where: {
      uuid: groupActorUUID,
      groupId: group.id,
    },
  });
  if (!isGroupActorExist) {
    throw '该角色不存在';
  }

  // 清空选择角色
  await db.transactionAsync(async function() {
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

export const agreeGroupActor: EventFunc<{
  groupUUID: string;
  groupActorUUID: string;
}> = async function agreeGroupActor(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '用户不存在，请检查登录状态';
  }

  let groupUUID = data.groupUUID;
  let groupActorUUID = data.groupActorUUID;
  if (!groupUUID || !groupActorUUID) {
    throw '缺少必要参数';
  }

  let group = await db.models.group_group.findOne({
    where: { uuid: groupUUID },
  });
  if (!group) {
    throw '找不到团';
  }
  if (!group.isManagerOrOwner(player.uuid)) {
    throw '没有操作权限';
  }
  let groupActor = await db.models.group_actor.findOne({
    where: {
      uuid: groupActorUUID,
      passed: false,
    },
  });
  if (!groupActor) {
    throw '找不到该角色';
  }
  groupActor.passed = true;
  await groupActor.save();
  return { groupActor };
};

export const refuseGroupActor: EventFunc<{
  groupUUID: string;
  groupActorUUID: string;
}> = async function refuseGroupActor(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '用户不存在，请检查登录状态';
  }

  let groupUUID = data.groupUUID;
  let groupActorUUID = data.groupActorUUID;
  if (!groupUUID || !groupActorUUID) {
    throw '缺少必要参数';
  }
  let group = await db.models.group_group.findOne({
    where: { uuid: groupUUID },
  });
  if (!group) {
    throw '找不到团';
  }
  if (!group.isManagerOrOwner(player.uuid)) {
    throw '没有操作权限';
  }
  let groupActor = await db.models.group_actor.findOne({
    where: {
      uuid: groupActorUUID,
      passed: false,
    },
  });
  if (!groupActor) {
    throw '找不到该角色';
  }
  await groupActor.destroy();
  return true;
};

export const updateGroupActorInfo: EventFunc<{
  groupUUID: string;
  groupActorUUID: string;
  groupActorInfo: string;
}> = async function updateGroupActorInfo(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '用户不存在，请检查登录状态';
  }

  let groupUUID = data.groupUUID;
  let groupActorUUID = data.groupActorUUID;
  let groupActorInfo = data.groupActorInfo;
  if (!groupUUID || !groupActorUUID || !groupActorInfo) {
    throw '缺少必要参数';
  }

  let group = await db.models.group_group.findOne({
    where: { uuid: groupUUID },
  });
  if (!group) {
    throw '找不到团';
  }
  if (!group.isManagerOrOwner(player.uuid)) {
    throw '没有修改权限, 只有管理员才能修改团人物卡信息';
  }
  let groupActor = await db.models.group_actor.findOne({
    where: {
      groupId: group.id,
      uuid: groupActorUUID,
    },
  });
  if (!groupActor) {
    throw '找不到团角色';
  }
  groupActor.actor_info = groupActorInfo;
  await groupActor.save();
  return true;
};

export const setPlayerSelectedGroupActor: EventFunc<{
  groupUUID: string;
  groupActorUUID: string;
}> = async function setPlayerSelectedGroupActor(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '用户不存在，请检查登录状态';
  }

  const userUUID = player.uuid;
  const groupUUID = data.groupUUID;
  const groupActorUUID = data.groupActorUUID; // 可以为null 即取消选择
  if (!groupUUID) {
    throw '缺少必要参数';
  }

  const group = await (db.models.group_group as any).findOne({
    where: { uuid: groupUUID },
  });
  if (!group) {
    throw '找不到团';
  }
  const members = await group.getMembers();
  let isSaved = false;
  for (let member of members) {
    if (member.uuid === userUUID) {
      member.group_group_members.selected_group_actor_uuid = groupActorUUID;
      await member.group_group_members.save();
      isSaved = true;
      break;
    }
  }
  if (!isSaved) {
    throw '当前用户不在团列表中';
  }

  // 通知团其他人
  socket.broadcast.to(groupUUID).emit('group::updatePlayerSelectedGroupActor', {
    userUUID,
    groupUUID,
    groupActorUUID,
  });

  return {
    data: { groupUUID, groupActorUUID },
  };
};

export const getPlayerSelectedGroupActor: EventFunc<{
  groupUUID: string;
  groupMemberUUID: string;
}> = async function getPlayerSelectedGroupActor(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '用户不存在，请检查登录状态';
  }

  let groupUUID = data.groupUUID;
  let groupMemberUUID = data.groupMemberUUID;
  if (!groupUUID || !groupMemberUUID) {
    throw '缺少必要参数';
  }

  let group = await db.models.group_group.findOne({
    where: { uuid: groupUUID },
  });
  if (!group) {
    throw '找不到团';
  }
  let members = await group.getMembers();
  let playerSelectedGroupActor;
  for (let member of members) {
    if (member.uuid === groupMemberUUID) {
      playerSelectedGroupActor = {
        groupMemberUUID,
        selectedGroupActorUUID:
          member.group_group_members.selected_group_actor_uuid,
      };
      break;
    }
  }
  if (!playerSelectedGroupActor) {
    throw '该用户不在团中';
  }

  return { playerSelectedGroupActor };
};

// 退出团
export const quitGroup: EventFunc<{
  groupUUID: string;
}> = async function quitGroup(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '用户不存在，请检查登录状态';
  }
  let groupUUID = data.groupUUID;
  if (!groupUUID) {
    throw '缺少必要参数';
  }

  let group = await db.models.group_group.findOne({
    where: { uuid: groupUUID },
  });
  if (!group) {
    throw '找不到团';
  }
  if (group.owner_uuid === player.uuid) {
    throw '作为团主持人你无法直接退出群';
  }

  const user = await PlayerUser.findByUUID(player.uuid);
  let removeMember = await group.removeMember(user);

  // 系统通知
  let managers_uuid = group.getManagerUUIDs();
  let systemMsg = `用户 ${user.getName()} 退出了团 [${group.name}]`;
  managers_uuid.forEach((uuid) => {
    if (uuid !== user.uuid) {
      app.chat.sendSystemSimpleMsg(uuid, systemMsg);
    }
  });
  cb({ result: true, removeMember });

  // 离开房间
  app.player.leaveSocketRoom(player.uuid, group.uuid);
};

// 解散团
export const dismissGroup: EventFunc<{
  groupUUID: string;
}> = async function dismissGroup(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '用户不存在，请检查登录状态';
  }
  let groupUUID = data.groupUUID;
  if (!groupUUID) {
    throw '缺少必要参数';
  }

  let group = await db.models.group_group.findOne({
    where: { uuid: groupUUID },
  });
  if (!group) {
    throw '找不到团';
  }
  if (group.owner_uuid !== player.uuid) {
    throw '你没有该权限';
  }

  // 系统通知
  let members = await group.getMembers();
  let systemMsg = `您的团 ${group.name} 解散了, ${members.length -
    1} 只小鸽子无家可归`;
  members.forEach((member) => {
    let uuid = member.uuid;
    if (uuid !== group.owner_uuid) {
      app.chat.sendSystemSimpleMsg(uuid, systemMsg);
    }
  });

  await group.destroy();
  return true;

  // TODO: 解散socket房间
};

export const tickMember: EventFunc<{
  groupUUID: string;
  memberUUID: string;
}> = async function tickMember(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '用户不存在，请检查登录状态';
  }
  let groupUUID = data.groupUUID;
  let memberUUID = data.memberUUID;
  if (!groupUUID || !memberUUID) {
    throw '缺少必要参数';
  }
  if (player.uuid === memberUUID) {
    throw '您不能踢出你自己';
  }

  let group = await db.models.group_group.findOne({
    where: { uuid: groupUUID },
  });
  if (!group) {
    throw '找不到团';
  }
  let member = await db.models.player_user.findOne({
    where: { uuid: memberUUID },
  });
  if (!member) {
    throw '找不到该成员';
  }
  if (!group.isManagerOrOwner(player.uuid)) {
    // 操作人不是管理
    throw '您没有该权限';
  } else if (
    group.isManagerOrOwner(memberUUID) &&
    group.owner_uuid !== player.uuid
  ) {
    // 被踢人是管理但操作人不是团所有人
    throw '您没有该权限';
  }
  if (!(await group.hasMember(member))) {
    throw '该团没有该成员';
  }

  await group.removeMember(member);
  // 发通知
  app.chat.sendSystemMsg(memberUUID, '', '', `您已被踢出团 [${group.name}]`);
  group.getManagerUUIDs().forEach((uuid) => {
    app.chat.sendSystemMsg(
      uuid,
      '',
      '',
      `团成员 ${member.getName()} 已被踢出团 [${group.name}]`
    );
  });
  cb({ result: true });

  // 离开房间
  app.player.leaveSocketRoom(memberUUID, group.uuid);
};

// 将普通用户提升为管理员
export const setMemberToManager: EventFunc<{
  groupUUID: string;
  memberUUID: string;
}> = async function setMemberToManager(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw '用户不存在，请检查登录状态';
  }
  let groupUUID = data.groupUUID;
  let memberUUID = data.memberUUID;
  if (!groupUUID || !memberUUID) {
    throw '缺少必要参数';
  }
  if (player.uuid === memberUUID) {
    throw '你不能将自己提升为管理员';
  }
  let group = await db.models.group_group.findOne({
    where: { uuid: groupUUID },
  });
  if (!group) {
    throw '找不到团';
  }
  let member = await db.models.player_user.findOne({
    where: { uuid: memberUUID },
  });
  if (!member) {
    throw '找不到该成员';
  }
  if (group.owner_uuid !== player.uuid) {
    // 操作人不是管理
    throw '您不是团的所有者';
  }
  if (group.managers_uuid.indexOf(memberUUID) >= 0) {
    // 操作人不是管理
    throw '该成员已经是团管理员';
  }
  if (!(await group.hasMember(member))) {
    throw '该团没有该成员';
  }
  group.managers_uuid = [...group.managers_uuid, memberUUID];
  let res = await group.save();

  // 发通知
  app.chat.sendSystemMsg(
    memberUUID,
    '',
    '',
    `您已成为团 [${group.name}] 的管理员`
  );
  group.getManagerUUIDs().forEach((uuid) => {
    app.chat.sendSystemMsg(
      uuid,
      '',
      '',
      `团成员 ${member.getName()} 已被提升为团 [${group.name}] 的管理员`
    );
  });
  return { group: res };
};

// 获取团状态
export const getGroupStatus: EventFunc<{
  groupUUID: string;
}> = async function getGroupStatus(data, cb) {
  const app = this.app;
  const socket = this.socket;

  let { groupUUID } = data;
  if (!groupUUID) {
    throw '缺少必要参数';
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
    throw '用户不存在，请检查登录状态';
  }
  let uuid = player.uuid;
  let { groupUUID, groupStatus } = data;
  groupStatus = Boolean(groupStatus);
  if (!groupUUID || groupStatus === undefined) {
    throw '缺少必要参数';
  }

  let group = await db.models.group_group.findOne({
    where: { uuid: groupUUID },
  });
  if (!group) {
    throw '没有找到该团';
  }
  if (!group.isManagerOrOwner(uuid)) {
    throw '没有修改团状态的权限';
  }

  app.cache.set(`group:${groupUUID}:status`, groupStatus);
  // 通知所有团成员更新团状态
  socket.broadcast.to(groupUUID).emit('group::updateGroupStatus', {
    groupUUID,
    groupStatus,
  });
  return true;
};
