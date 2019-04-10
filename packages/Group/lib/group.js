const debug = require('debug')('trpg:component:group');
const event = require('./event');
const uuid = require('uuid/v4');

module.exports = function GroupComponent(app) {
  initStorage.call(app);
  initFunction.call(app);
  initSocket.call(app);
  initTimer.call(app);
  initReset.call(app);

  return {
    name: 'GroupComponent',
    require: [
      'PlayerComponent',
      'ChatComponent',
      'ActorComponent',
    ],
  }
}

function initStorage() {
  let app = this;
  let storage = app.storage;
  storage.registerModel(require('./models/group.js'));
  storage.registerModel(require('./models/invite.js'));
  storage.registerModel(require('./models/actor.js'));
  storage.registerModel(require('./models/request.js'));

  app.on('initCompleted', function(app) {
    // 数据信息统计
    debug('storage has been load 4 group db model');
  });
}

function initFunction() {
  let app = this;
  let db = app.storage.db;
  app.group = {
    addGroupMemberAsync: async function(groupUUID, userUUID) {
      if(!groupUUID || !userUUID) {
        debug('add group need 2 uuid: receive %o', {groupUUID, userUUID});
        return;
      }

      try {
        // 检查是否已加入
        let group = await db.models.group_group.oneAsync({uuid: groupUUID});
        let user = await db.models.player_user.oneAsync({uuid: userUUID});
        if(group && user) {
          let members = await group.getMembers();
          for (let u of members) {
            if(u.uuid === user.uuid) {
              return false;
            }
          }
          let res = await group.addMember(user);

          // 检查是否在线, 如果在线则发送一条更新通知
          if(app.player) {
            let player = app.player.list.get(user.uuid);
            if(player) {
              player.socket.emit('group::addGroupSuccess', {group});
              app.player.joinSocketRoom(user.uuid, group.uuid);
            }
          }

          return res;
        }else {
          throw new Error(`团信息不全或添加的成员信息不全: ${groupUUID} ${userUUID}`);
        }
      }catch(err){
        console.error('[addGroupMemberAsync]', err);
        throw err;
      }
    },
    getGroupManagersUUIDAsync: async function(groupUUID) {
      try {
        let group = await db.models.group_group.oneAsync({uuid: groupUUID});
        return [group.owner_uuid, ...group.managers_uuid]
      }catch(err) {
        console.error('[getGroupManagers]', err);
        return [];
      }
    },
  }
}

function initSocket() {
  let app = this;
  app.registerEvent('group::create', event.create);
  app.registerEvent('group::getInfo', event.getInfo);
  app.registerEvent('group::updateInfo', event.updateInfo);
  app.registerEvent('group::findGroup', event.findGroup);
  app.registerEvent('group::requestJoinGroup', event.requestJoinGroup);
  app.registerEvent('group::agreeGroupRequest', event.agreeGroupRequest);
  app.registerEvent('group::refuseGroupRequest', event.refuseGroupRequest);
  app.registerEvent('group::sendGroupInvite', event.sendGroupInvite);
  app.registerEvent('group::refuseGroupInvite', event.refuseGroupInvite);
  app.registerEvent('group::agreeGroupInvite', event.agreeGroupInvite);
  app.registerEvent('group::getGroupInvite', event.getGroupInvite);
  app.registerEvent('group::getGroupList', event.getGroupList);
  app.registerEvent('group::getGroupMembers', event.getGroupMembers);
  app.registerEvent('group::getGroupActors', event.getGroupActors);
  app.registerEvent('group::addGroupActor', event.addGroupActor);
  app.registerEvent('group::removeGroupActor', event.removeGroupActor);
  app.registerEvent('group::agreeGroupActor', event.agreeGroupActor);
  app.registerEvent('group::refuseGroupActor', event.refuseGroupActor);
  app.registerEvent('group::updateGroupActorInfo', event.updateGroupActorInfo);
  app.registerEvent('group::setPlayerSelectedGroupActor', event.setPlayerSelectedGroupActor);
  app.registerEvent('group::getPlayerSelectedGroupActor', event.getPlayerSelectedGroupActor);
  app.registerEvent('group::quitGroup', event.quitGroup);
  app.registerEvent('group::dismissGroup', event.dismissGroup);
  app.registerEvent('group::tickMember', event.tickMember);
  app.registerEvent('group::setMemberToManager', event.setMemberToManager);
  app.registerEvent('group::getGroupStatus', event.getGroupStatus);
  app.registerEvent('group::setGroupStatus', event.setGroupStatus);
}

function initTimer() {
  const app = this;
  const db = app.storage.db;

  app.registerStatJob('groupCount', async () => {
    let res = await db.models.group_group.countAsync();
    return res;
  })
}

function initReset() {
  let app = this;
  app.register('resetStorage', async function(storage, db) {
    debug('start reset group storage');
    if(!app.player) {
      throw new Error('[GroupComponent] require component [PlayerComponent]');
    }
    if(!app.actor) {
      throw new Error('[GroupComponent] require component [ActorComponent]');
    }

    const modelUser = db.models.player_user;
    const modelGroup = db.models.group_group;
    let groups = await modelGroup.bulkCreate([{
      type: 'group',
      name: '测试团',
      avatar: '',
      creator_uuid: 'system',
      owner_uuid: 'system',
      managers_uuid: [],
      maps_uuid: [],
    }, {
      type: 'group',
      name: '测试团2',
      avatar: 'http://www.jf258.com/uploads/2014-08-02/112428572.jpg',
      creator_uuid: 'system',
      owner_uuid: 'system',
      managers_uuid: [],
      maps_uuid: [],
    }])
    let group = groups[0];
    let user = await modelUser.findByPk(1);
    let user2 = await modelUser.findByPk(2);
    group.creator_uuid = user.uuid;
    group.owner_uuid = user.uuid;
    await group.setOwner(user);
    await app.group.addGroupMemberAsync(group.uuid, user.uuid);
    await app.group.addGroupMemberAsync(group.uuid, user2.uuid);
    groups[1].owner_uuid = user2.uuid;
    await groups[1].setOwner(user2);
    await app.group.addGroupMemberAsync(groups[1].uuid, user2.uuid);

    // 增加测试的团人物
    let actor = await db.models.actor_actor.findByPk(1);
    let groupActor = await db.models.group_actor.create({
      actor_uuid: actor.uuid,
      actor_info: {},
      avatar: '',
      passed: false, // 测试
    })
    await groupActor.setOwner(user);
    await groupActor.setActor(actor);
    await groupActor.setGroup(group);
  })
}
