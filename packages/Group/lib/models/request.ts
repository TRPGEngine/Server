import _ from 'lodash';
import { ChatLog } from 'packages/Chat/lib/models/log';
import { GroupGroup } from 'packages/Group/lib/models/group';
import { PlayerUser } from 'packages/Player/lib/models/user';
import { Orm, DBInstance, Model } from 'trpg/core';

export class GroupRequest extends Model {
  uuid: string;
  group_uuid: string;
  from_uuid: string;
  is_agree: boolean;
  is_refuse: boolean;

  /**
   * 同意入团请求
   * @param requestUUID 入团请求
   * @param operatorUUID 操作人UUID
   */
  static async agreeGroupRequest(requestUUID: string, operatorUUID: string) {
    const request = await GroupRequest.findOne({
      where: { uuid: requestUUID },
    });
    if (!request) {
      throw new Error('找不到该入团申请');
    }
    if (request.is_agree === true) {
      throw new Error('已同意该请求');
    }

    const groupUUID = request.group_uuid;
    const fromUUID = request.from_uuid; // 请求入团的人的UUID
    const group = await GroupGroup.findByUUID(groupUUID);
    if (!group) {
      throw new Error('找不到该团');
    }

    // 发送入团成功消息
    const user = await PlayerUser.findByUUID(operatorUUID);
    if (_.isNil(user)) {
      throw new Error('用户状态异常');
    }

    const trpgapp = GroupRequest.getApplication();
    await trpgapp.storage.transaction('agreeGroupRequest', async () => {
      await GroupGroup.addGroupMember(groupUUID, fromUUID, operatorUUID);
      await request.agreeAsync();
    });

    const systemMsg = `管理员 ${user.getName()} 已同意您加入团 [${
      group.name
    }] ,和大家打个招呼吧!`;

    ChatLog.sendSystemMsg({
      to_uuid: fromUUID,
      type: 'card',
      message: systemMsg,
      converse_uuid: null,
      data: {
        type: 'groupRequestSuccess',
        title: '入团成功',
        content: systemMsg,
        groupUUID,
      },
    });

    return {
      group,
    };
  }

  /**
   * 拒绝入团
   * @param requestUUID 入团请求
   * @param operatorUUID 操作人UUID
   */
  static async refuseGroupRequest(requestUUID: string, operatorUUID: string) {
    const request = await GroupRequest.findOne({
      where: { uuid: requestUUID },
    });
    if (!request) {
      throw new Error('找不到该入团申请');
    }
    if (request.is_agree === true) {
      return true;
    }

    const groupUUID = request.group_uuid;
    const group = await GroupGroup.findByUUID(groupUUID);
    if (!group) {
      throw new Error('找不到该团');
    }

    await request.refuseAsync();

    const user = await PlayerUser.findByUUID(operatorUUID);
    const systemMsg = `管理员 ${user.getName()} 已拒绝您加入团 ${group.name}。`;

    ChatLog.sendSystemMsg({
      to_uuid: request.from_uuid,
      type: 'card',
      message: systemMsg,
      converse_uuid: null,
      data: {
        type: 'groupRequestFail',
        title: '入团被拒',
        content: systemMsg,
        groupUUID,
      },
    });
  }

  async agreeAsync() {
    this.is_agree = true;
    this.is_refuse = false;
    return await this.save();
  }

  async refuseAsync() {
    this.is_agree = false;
    this.is_refuse = true;
    return await this.save();
  }
}

export default function GroupRequestDefinition(Sequelize: Orm, db: DBInstance) {
  GroupRequest.init(
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      group_uuid: { type: Sequelize.UUID, required: true },
      from_uuid: { type: Sequelize.UUID, required: true },
      is_agree: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_refuse: { type: Sequelize.BOOLEAN, defaultValue: false },
    },
    {
      tableName: 'group_request',
      sequelize: db,
    }
  );

  return GroupRequest;
}
