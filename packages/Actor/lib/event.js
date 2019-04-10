const debug = require('debug')('trpg:component:actor:event');

exports.getTemplate = async function(data, cb, db) {
  let app = this.app;
  let socket = this.socket;

  let player = app.player.list.find(socket);
  if(!player) {
    throw '用户不存在，请检查登录状态';
  }

  let uuid = data.uuid;
  if(!uuid || typeof uuid !== 'string') {
    // 返回个人所有的模板
    let user = await db.models.player_user.oneAsync({uuid: player.uuid});
    let templates = await user.getTemplates();
    return {templates};
  }else {
    // 返回指定模板信息
    let template = await db.models.actor_template.oneAsync({uuid});
    return {template}
  }
}

exports.findTemplate = async function (data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.list.find(socket);
  if(!player) {
    throw '用户不存在，请检查登录状态';
  }

  let nameFragment = data.name;
  if(!nameFragment) {
    throw '缺少必要参数';
  }

  let templates = await db.models.actor_template.findTemplateAsync(nameFragment);
  for (template of templates) {
    let creator = await template.getCreator();
    if(creator) {
      template.dataValues.creator_name = creator.getName();
    }
  }
  return {templates};
}

exports.createTemplate = async function(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  let player = app.player.list.find(socket);
  if(!player) {
    throw '用户不存在，请检查登录状态';
  }

  let name = data.name;
  let desc = data.desc || '';
  let avatar = data.avatar || '';
  let info = data.info;

	if(!name) {
    throw '缺少模板名'
	}

	if(!info) {
    throw '缺少模板信息';
  }

  let isExistTemplate = await db.models.actor_template.findOne({
    where: {name}
  });
  if(isExistTemplate) {
    throw '该模板名字已存在'
  }

  let template = await db.models.actor_template.create({
    name,
    desc,
    avatar,
    info,
  });
  await template.setCreator(player.user);
  return {template};
}

exports.updateTemplate = async function(data, cb, db) {
  let app = this.app;
  let socket = this.socket;

  let player = app.player.list.find(socket);
  if(!player) {
    throw '用户不存在，请检查登录状态';
  }

  let uuid = data.uuid;
  let name = data.name;
  let desc = data.desc;
  let avatar = data.avatar;
  let info = data.info;

  if(!uuid || typeof uuid !== 'string') {
    throw '缺少必要参数';
  }

  let template = await db.models.actor_template.findOne({
    where: {uuid}
  });
  if(template.creatorId !== player.user.id) {
    throw '您不是该模板的所有者，无法修改模板';
  }
  if(name) {
    template.name = name;
  }
  if(desc) {
    template.desc = desc;
  }
  if(avatar) {
    template.avatar = avatar;
  }
  if(info) {
    template.info = info;
  }
  template = await template.save();

  return {template}
}

exports.removeTemplate = async function(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  let player = app.player.list.find(socket);
  if(!player) {
    throw '用户不存在，请检查登录状态';
  }

  let uuid = data.uuid;
  let template = await db.models.actor_template.findOne({
    where: {
      uuid,
      creatorId: player.user.id
    }
  });
  if(!template) {
    throw '删除失败，找不到该模板';
  }
  await template.destroy();
  return true;
}

exports.createActor = async function(data, cb, db) {
  let app = this.app;
  let socket = this.socket;

  let player = app.player.list.find(socket);
  if(!player) {
    throw '用户不存在，请检查登录状态';
  }

  let name = data.name;
  let avatar = data.avatar;
  let desc = data.desc;
  let info = data.info || {};
  let template_uuid = data.template_uuid;
  if(!name) {
    throw '人物名不能为空';
  }

  let actor = null;
  await db.transactionAsync(async () => {
    actor = await db.models.actor_actor.createAsync({
      name,
      avatar,
      desc,
      info,
      template_uuid,
    });
    await actor.setOwner(player.user);
    if(!!avatar) {
      let tmp = avatar.split('/');
      let avatarModel = await db.models.file_avatar.oneAsync({name: tmp[tmp.length - 1]});
      if(avatarModel) {
        avatarModel.attach_uuid = actor.uuid;
        avatarModel.save(); // 不使用await，做一个延时返回
      }
    }
  })

  if(actor) {
    return {actor: actor.getObject()};
  }else {
    return false;
  }
}

exports.getActor = async function(data, cb, db) {
  let app = this.app;
  let socket = this.socket;

  let player = app.player.list.find(socket);
  if(!player) {
    throw '用户不存在，请检查登录状态';
  }

  let uuid = data.uuid;
  if(uuid) {
    // 返回指定的actor
    let actor = await db.models.actor_actor.oneAsync({uuid});
    return {actor};
  }else {
    // 返回当前用户所有的actor
    let user = await db.models.player_user.oneAsync({uuid: player.uuid});
    let actors = await user.getActors();
    return {actors};
  }
}

exports.removeActor = async function(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  let player = app.player.list.find(socket);
  if(!player) {
    throw '用户不存在，请检查登录状态';
  }
  let uuid = data.uuid;
  if(!uuid) {
    throw '缺少必要参数';
  }

  await db.transactionAsync(async () => {
    let actor = await db.models.actor_actor.oneAsync({uuid, ownerId: player.user.id});
    if(!actor) {
      throw '没有找到该角色';
    }
    await actor.destroy();

    if(db.models.group_actor) {
      // 如果有group actor模型
      // 移除所有相关的团角色
      await db.models.group_actor.destroy({
        where: {actor_uuid: uuid}
      })
    }
  })
  return true;
}

exports.updateActor = async function(data, cb, db) {
  let app = this.app;
  let socket = this.socket;

  let player = app.player.list.find(socket);
  if(!player) {
    throw '用户不存在，请检查登录状态';
  }

  let uuid = data.uuid;
  let name = data.name;
  let avatar = data.avatar;
  let desc = data.desc;
  let info = data.info || {};
  if(!uuid) {
    throw '缺少必要参数'
  }
  if(!name) {
    throw '人物名不能为空';
  }

  return await db.transactionAsync(async () => {
    let actor = await db.models.actor_actor.findOne({
      where: {uuid}
    });
    let oldAvatar = actor.avatar.toString();
    actor.name = name;
    actor.avatar = avatar;
    actor.desc = desc;
    actor.info = info;
    let saveActor = await actor.save();

    if(db.models.file_avatar && oldAvatar && oldAvatar !== avatar) {
      // 更新avatar的attach
      let oldtmp = oldAvatar.split('/');
      let tmp = avatar.split('/');
      let userId = player.user.id;
      let oldAvatarInstance = await db.models.file_avatar.findOne({
        where: {
          name: oldtmp[oldtmp.length - 1],
          ownerId: userId
        },
        order: [['id', 'DESC']]
      })
      if(oldAvatarInstance) {
        oldAvatarInstance.attach_uuid = null;
        await oldAvatarInstance.save();
      }

      let avatarInstance = await db.models.file_avatar.findOne({
        where: {
          name: tmp[tmp.length - 1],
          ownerId: userId
        },
        order: [['id', 'DESC']]
      })
      avatarInstance.attach_uuid = uuid;
      await avatarInstance.save();
    }

    return {actor: saveActor.getObject()}
  });
}
