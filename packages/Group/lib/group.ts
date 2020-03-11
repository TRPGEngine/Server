import Debug from 'debug';
const debug = Debug('trpg:component:group');
import * as event from './event';
import BasePackage from 'lib/package';
import GroupGroupDefinition from './models/group';
import GroupInviteDefinition from './models/invite';
import GroupActorDefinition from './models/actor';
import GroupRequestDefinition from './models/request';
import GroupDetailDefinition from './models/detail';
import actorRouter from './routers/actor';
import GroupChannelDefinition from './models/channel';

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
    this.regModel(GroupChannelDefinition);

    const app = this.app;
    const db = this.db;
    this.regMethods({
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
    this.regSocketEvent('saveGroupDetail', event.saveGroupDetail);
    this.regSocketEvent('createGroupChannel', event.createGroupChannel);
    this.regSocketEvent('addGroupChannelMember', event.addGroupChannelMember);
    this.regSocketEvent(
      'removeGroupChannelMember',
      event.removeGroupChannelMember
    );

    this.regRoute(actorRouter);

    this.regStatJob('groupCount', async () => {
      let res = await db.models.group_group.count();
      return res;
    });
  }
}
