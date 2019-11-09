import Debug from 'debug';
const debug = Debug('trpg:component:group');
import * as event from './event';
import BasePackage from 'lib/package';
import GroupGroupDefinition from './models/group';
import GroupInviteDefinition from './models/invite';
import GroupActorDefinition from './models/actor';
import GroupRequestDefinition from './models/request';
import GroupDetailDefinition from './models/detail';

export default class Group extends BasePackage {
  public name: string = 'Group';
  public require: string[] = ['Player', 'File', 'Chat'];
  public desc: string = '团模块';
  onInit(): void {
    this.regModel(GroupGroupDefinition);
    this.regModel(GroupInviteDefinition);
    this.regModel(GroupActorDefinition);
    this.regModel(GroupRequestDefinition);
    this.regModel(GroupDetailDefinition);

    const app = this.app;
    const db = this.db;
    this.regMethods({
      addGroupMemberAsync: async function(groupUUID: string, userUUID: string) {
        if (!groupUUID || !userUUID) {
          debug('add group need 2 uuid: receive %o', { groupUUID, userUUID });
          return;
        }

        try {
          // 检查是否已加入
          let group = await (db.models.group_group as any).findOne({
            where: { uuid: groupUUID },
          });
          let user = await (db.models.player_user as any).findOne({
            where: { uuid: userUUID },
          });
          if (group && user) {
            let members = await group.getMembers();
            for (let u of members) {
              if (u.uuid === user.uuid) {
                return false;
              }
            }
            let res = await group.addMember(user);

            if (app.player) {
              if (await app.player.manager.checkPlayerOnline(user.uuid)) {
                // 检查是否在线, 如果在线则发送一条更新通知
                app.player.manager.unicastSocketEvent(
                  user.uuid,
                  'group::addGroupSuccess',
                  { group }
                );
                app.player.manager.joinRoomWithUUID(group.uuid, user.uuid);
              }
            }

            return res;
          } else {
            throw new Error(
              `团信息不全或添加的成员信息不全: ${groupUUID} ${userUUID}`
            );
          }
        } catch (err) {
          console.error('[addGroupMemberAsync]', err);
          throw err;
        }
      },
      getGroupManagersUUIDAsync: async function(groupUUID) {
        try {
          let group = await (db.models.group_group as any).findOne({
            uuid: groupUUID,
          });
          return [group.owner_uuid, ...group.managers_uuid];
        } catch (err) {
          console.error('[getGroupManagers]', err);
          return [];
        }
      },
    });

    this.regSocketEvent('create', event.create);
    this.regSocketEvent('getInfo', event.getInfo);
    this.regSocketEvent('updateInfo', event.updateInfo);
    this.regSocketEvent('findGroup', event.findGroup);
    this.regSocketEvent('requestJoinGroup', event.requestJoinGroup);
    this.regSocketEvent('agreeGroupRequest', event.agreeGroupRequest);
    this.regSocketEvent('refuseGroupRequest', event.refuseGroupRequest);
    this.regSocketEvent('sendGroupInvite', event.sendGroupInvite);
    this.regSocketEvent('sendGroupInviteBatch', event.sendGroupInviteBatch);
    this.regSocketEvent('refuseGroupInvite', event.refuseGroupInvite);
    this.regSocketEvent('agreeGroupInvite', event.agreeGroupInvite);
    this.regSocketEvent('getGroupInvite', event.getGroupInvite);
    this.regSocketEvent('getGroupInviteDetail', event.getGroupInviteDetail);
    this.regSocketEvent('getGroupList', event.getGroupList);
    this.regSocketEvent('getGroupMembers', event.getGroupMembers);
    this.regSocketEvent('getGroupActors', event.getGroupActors);
    this.regSocketEvent('getGroupActorMapping', event.getGroupActorMapping);
    this.regSocketEvent('addGroupActor', event.addGroupActor);
    this.regSocketEvent('removeGroupActor', event.removeGroupActor);
    this.regSocketEvent('agreeGroupActor', event.agreeGroupActor);
    this.regSocketEvent('refuseGroupActor', event.refuseGroupActor);
    this.regSocketEvent('updateGroupActorInfo', event.updateGroupActorInfo);
    this.regSocketEvent(
      'setPlayerSelectedGroupActor',
      event.setPlayerSelectedGroupActor
    );
    this.regSocketEvent(
      'getPlayerSelectedGroupActor',
      event.getPlayerSelectedGroupActor
    );
    this.regSocketEvent('quitGroup', event.quitGroup);
    this.regSocketEvent('dismissGroup', event.dismissGroup);
    this.regSocketEvent('tickMember', event.tickMember);
    this.regSocketEvent('setMemberToManager', event.setMemberToManager);
    this.regSocketEvent('getGroupStatus', event.getGroupStatus);
    this.regSocketEvent('setGroupStatus', event.setGroupStatus);

    this.regStatJob('groupCount', async () => {
      let res = await db.models.group_group.count();
      return res;
    });
  }
}

// TODO: 移除RESET 改用seeder进行数据填充
function initReset() {
  let app = this;
  app.register('resetStorage', async function(storage, db) {
    debug('start reset group storage');
    if (!app.player) {
      throw new Error('[GroupComponent] require component [PlayerComponent]');
    }
    if (!app.actor) {
      throw new Error('[GroupComponent] require component [ActorComponent]');
    }

    const modelUser = db.models.player_user;
    const modelGroup = db.models.group_group;
    let groups = await modelGroup.bulkCreate([
      {
        type: 'group',
        name: '测试团',
        avatar: '',
        creator_uuid: 'system',
        owner_uuid: 'system',
        managers_uuid: [],
        maps_uuid: [],
      },
      {
        type: 'group',
        name: '测试团2',
        avatar: 'http://www.jf258.com/uploads/2014-08-02/112428572.jpg',
        creator_uuid: 'system',
        owner_uuid: 'system',
        managers_uuid: [],
        maps_uuid: [],
      },
    ]);
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
    });
    await groupActor.setOwner(user);
    await groupActor.setActor(actor);
    await groupActor.setGroup(group);
  });
}
