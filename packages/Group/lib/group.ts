import Debug from 'debug';
const debug = Debug('trpg:component:group');
import * as event from './event';
import BasePackage from 'lib/package';
import GroupGroupDefinition, { GroupGroup } from './models/group';
import GroupInviteDefinition from './models/invite';
import GroupActorDefinition from './models/actor';
import GroupRequestDefinition from './models/request';
import GroupDetailDefinition from './models/detail';
import GroupInviteCodeDefinition from './models/invite-code';
import actorRouter from './routers/actor';
import groupRouter from './routers/group';
import GroupChannelDefinition, { GroupChannel } from './models/channel';
import { regRoomGather } from 'packages/Player/lib/managers/socketroom-manager';
import GroupPanelDefinition from './models/panel';
import panelRouter from './routers/panel';
import { regGroupPanelHandler } from './panels/reg';
import { startWriting, stopWriting } from './chatEvent';
import inviteCodeRouter from './routers/invite-code';
import GroupVoiceChannelDefinition, {
  GroupVoiceChannel,
} from './models/voice-channel';

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
    this.regModel(GroupPanelDefinition);
    this.regModel(GroupInviteCodeDefinition);
    this.regModel(GroupVoiceChannelDefinition);

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
    this.regSocketEvent('getGroupInitData', event.getGroupInitData);
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
    this.regSocketEvent('createGroupPanel', event.createGroupPanel);

    // 注册chat的事件
    this.regSocketEvent('chat::startWriting', startWriting);
    this.regSocketEvent('chat::stopWriting', stopWriting);

    this.regRoute(actorRouter);
    this.regRoute(groupRouter);
    this.regRoute(panelRouter);
    this.regRoute(inviteCodeRouter);

    this.regStatJob('groupCount', async () => {
      let res = await db.models.group_group.count();
      return res;
    });

    regRoomGather(async (user) => {
      const groups: GroupGroup[] = await user.getGroups();

      return groups.map((g) => g.uuid);
    });

    // 文字频道的团面板
    regGroupPanelHandler('channel', {
      async onCreate(panelInfo) {
        const channel = await GroupChannel.createChannel(
          panelInfo.groupUUID,
          panelInfo.userUUID,
          panelInfo.name,
          panelInfo.name
        );

        return {
          targetUUID: channel.uuid,
          other: {
            groupChannel: channel,
          },
        };
      },
      async onDestroy(panel, options) {
        await GroupChannel.destroy({
          where: {
            uuid: panel.target_uuid,
          },
          ...options,
        });
      },
    });
    // 语音频道的团面板
    regGroupPanelHandler('voicechannel', {
      async onCreate(panelInfo) {
        const channel = await GroupVoiceChannel.createVoiceChannel(
          panelInfo.groupUUID,
          panelInfo.userUUID,
          panelInfo.name,
          panelInfo.name
        );

        return {
          targetUUID: channel.uuid,
          other: {
            groupChannel: channel,
          },
        };
      },
      async onDestroy(panel, options) {
        await GroupVoiceChannel.destroy({
          where: {
            uuid: panel.target_uuid,
          },
          ...options,
        });
      },
    });
  }
}
