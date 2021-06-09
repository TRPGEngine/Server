import Debug from 'debug';
import { EventFunc } from 'trpg/core';
import _ from 'lodash';
import { ActorTemplate } from './models/template';
import { PlayerUser } from 'packages/Player/lib/models/user';
import { ActorActor } from './models/actor';
import { FileAvatar } from 'packages/File/lib/models/avatar';
import { GroupActor } from './models/group-actor';
import { GroupGroup } from 'packages/Group/lib/models/group';
const debug = Debug('trpg:component:actor:event');

export const getTemplate: EventFunc<{
  uuid: string;
}> = async function (data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const uuid = data.uuid;
  if (!uuid || typeof uuid !== 'string') {
    // 返回个人所有的模板
    const user = await PlayerUser.findByUUID(player.uuid);
    const templates = await (user as any).getTemplates();
    return { templates };
  } else {
    // 返回指定模板信息
    const template = await ActorTemplate.findByUUID(uuid);
    return { template };
  }
};

/**
 * 获取推荐角色模板
 */
export const getSuggestTemplate: EventFunc<{}> = async function (data, cb, db) {
  const templates = await ActorTemplate.getRecommendList();

  return { templates };
};

export const findTemplate: EventFunc<{
  name: string;
}> = async function (data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  let nameFragment = data.name;
  if (!nameFragment) {
    throw new Error('缺少必要参数');
  }

  const templates = await ActorTemplate.findTemplateAsync(nameFragment);
  for (let template of templates) {
    let creator = await template.getCreator();
    if (creator) {
      template.setDataValue('creator_name' as any, creator.getName());
    } else {
      // 处理当没有指定creator的情况
      template.setDataValue(
        'creator_name' as any,
        template.built_in ? '系统' : '未知'
      );
    }
  }
  return { templates };
};

export const createTemplate: EventFunc<{
  name: string;
  desc?: string;
  avatar?: string;
  info: string;
}> = async function (data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const name = data.name;
  const desc = data.desc || '';
  const avatar = data.avatar || '';
  const info = data.info;

  const template = await ActorTemplate.createTemplate(
    name,
    desc,
    avatar,
    info,
    player.uuid
  );

  return { template };
};

export const updateTemplate: EventFunc<{
  uuid: string;
  name: string;
  desc: string;
  avatar: string;
  info: string;
}> = async function (data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const uuid = data.uuid;
  const name = data.name;
  const desc = data.desc;
  const avatar = data.avatar;
  const info = data.info;

  if (!uuid || typeof uuid !== 'string') {
    throw '缺少必要参数';
  }

  let template = await db.models.actor_template.findOne({
    where: { uuid },
  });
  const user = await PlayerUser.findByUUID(player.uuid);
  if (template.creatorId !== user.id) {
    throw new Error('您不是该模板的所有者，无法修改模板');
  }
  if (name) {
    template.name = name;
  }
  if (desc) {
    template.desc = desc;
  }
  if (avatar) {
    template.avatar = avatar;
  }
  if (info) {
    template.info = info;
  }
  template = await template.save();

  return { template };
};

export const removeTemplate: EventFunc<{
  uuid: string;
}> = async function (data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const uuid = data.uuid;
  const user = await PlayerUser.findByUUID(player.uuid);
  const template = await db.models.actor_template.findOne({
    where: {
      uuid,
      creatorId: user.id,
    },
  });
  if (!template) {
    throw new Error('删除失败，找不到该模板');
  }
  await template.destroy();
  return true;
};

export const createActor: EventFunc<{
  name: string;
  avatar: string;
  desc: string;
  info: {};
  template_uuid: string;
}> = async function (data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const name = data.name;
  const avatar = data.avatar;
  const desc = data.desc;
  const info = data.info || {};
  const template_uuid = data.template_uuid;
  if (!name) {
    throw new Error('人物名不能为空');
  }

  let actor = null;
  await db.transactionAsync(async () => {
    actor = await ActorActor.create({
      name,
      avatar,
      desc,
      info,
      template_uuid,
    });
    const user = await PlayerUser.findByUUID(player.uuid);
    await actor.setOwner(user);
    if (!!avatar) {
      // 如果头像已存在
      let tmp = avatar.split('/');
      let avatarModel = await FileAvatar.findOne({
        where: {
          name: tmp[tmp.length - 1],
        },
      });
      if (avatarModel) {
        avatarModel.attach_uuid = actor.uuid;
        avatarModel.save(); // 不使用await，做一个延时返回
      }
    }
  });

  if (actor) {
    return { actor: actor.getObject() };
  } else {
    return false;
  }
};

export const getActor: EventFunc<{
  uuid: string;
}> = async function (data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const uuid = data.uuid;
  if (uuid) {
    // 返回指定的actor
    const actor = await ActorActor.findByUUID(uuid);
    return { actor };
  } else {
    // 返回当前用户所有的actor
    const user = await PlayerUser.findByUUID(player.uuid);
    const actors = await user.getActors();
    return { actors };
  }
};

/**
 * 删除角色
 */
export const removeActor: EventFunc<{
  uuid: string;
}> = async function (data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }
  const uuid = data.uuid;
  if (!uuid) {
    throw new Error('缺少必要参数');
  }

  await ActorActor.remove(uuid, player.uuid);

  return true;
};

export const updateActor: EventFunc<{
  uuid: string;
  name: string;
  avatar: string;
  desc: string;
  info: {};
}> = async function (data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }
  const user = await PlayerUser.findByUUID(player.uuid);
  const userId = user.id;

  const uuid = data.uuid;
  const name = data.name;
  const avatar = data.avatar;
  const desc = data.desc;
  const info = data.info || {};
  if (!uuid) {
    throw new Error('缺少必要参数');
  }
  if (!name) {
    throw new Error('人物名不能为空');
  }

  return await db.transactionAsync(async () => {
    let actor = await ActorActor.findOne({
      where: { uuid, ownerId: userId },
    });
    if (_.isNil(actor)) {
      throw new Error('无法更新角色信息: 该角色不存在');
    }

    let oldAvatar = String(actor.avatar ?? '');
    actor.name = name;
    actor.avatar = avatar;
    actor.desc = desc;
    actor.info = info;
    let saveActor = await actor.save();

    if (FileAvatar && oldAvatar && oldAvatar !== avatar) {
      // 更新avatar的attach

      const user = await PlayerUser.findByUUID(player.uuid);
      let oldtmp = oldAvatar.split('/');
      let tmp = avatar.split('/');
      let userId = user.id;
      let oldAvatarInstance = await FileAvatar.findOne({
        where: {
          name: oldtmp[oldtmp.length - 1],
          ownerId: userId,
        },
        order: [['id', 'DESC']],
      });
      if (oldAvatarInstance) {
        oldAvatarInstance.attach_uuid = null;
        await oldAvatarInstance.save();
      }

      const avatarInstance = await FileAvatar.findOne({
        where: {
          name: tmp[tmp.length - 1],
          ownerId: userId,
        },
        order: [['id', 'DESC']],
      });
      avatarInstance.attach_uuid = uuid;
      await avatarInstance.save();
    }

    return { actor: saveActor.getObject() };
  });
};

/**
 * 分享人物卡
 */
export const shareActor: EventFunc<{
  actorUUID: string;
}> = async function (data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (_.isNil(player)) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const actorUUID = data.actorUUID;
  if (_.isNil(actorUUID)) {
    throw new Error('缺少必要参数');
  }

  await ActorActor.shareActor(actorUUID, player.uuid);

  return true;
};

/**
 * 取消分享人物卡
 */
export const unshareActor: EventFunc<{
  actorUUID: string;
}> = async function (data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (_.isNil(player)) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const actorUUID = data.actorUUID;
  if (_.isNil(actorUUID)) {
    throw new Error('缺少必要参数');
  }

  await ActorActor.unshareActor(actorUUID, player.uuid);

  return true;
};

/**
 * fork人物卡
 */
export const forkActor: EventFunc<{
  targetActorUUID: string;
}> = async function (data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (_.isNil(player)) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const targetActorUUID = data.targetActorUUID;
  if (_.isNil(targetActorUUID)) {
    throw new Error('缺少必要参数');
  }

  const actor = await ActorActor.forkActor(targetActorUUID, player.uuid);

  return { actor };
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

/**
 * 获取GroupActor的初始化信息
 */
export const getGroupActorInitData: EventFunc<{
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

  // 获取团人物
  const groupActors: GroupActor[] = await group.getGroupActors();

  // 获取团选择人物的Mapping
  const groupActorsMapping = await group.getGroupActorMapping(player.uuid);

  return { groupActors, groupActorsMapping };
};
