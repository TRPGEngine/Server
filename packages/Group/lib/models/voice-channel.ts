import {
  Model,
  Orm,
  DBInstance,
  HasManyCreateAssociationMixin,
} from 'trpg/core';
import { GroupGroup } from './group';
import _ from 'lodash';

declare module './group' {
  interface GroupGroup {
    createVoiceChannel: HasManyCreateAssociationMixin<GroupVoiceChannel>;
  }
}

/**
 * 一个群组可以有多个频道
 */
export class GroupVoiceChannel extends Model {
  uuid: string;
  name: string;
  desc: string;

  static findByUUID(uuid: string): Promise<GroupVoiceChannel> {
    return GroupVoiceChannel.findOne({
      where: {
        uuid,
      },
    });
  }

  /**
   *
   * @param groupUUID 所属团UUID
   * @param operatorUserUUID 操作人UUID
   * @param name 频道名
   * @param desc 频道描述
   */
  static async createVoiceChannel(
    groupUUID: string,
    operatorUserUUID: string,
    name: string,
    desc: string
  ): Promise<GroupVoiceChannel> {
    const group = await GroupGroup.findByUUID(groupUUID);
    if (!group.isManagerOrOwner(operatorUserUUID)) {
      throw new Error('没有创建频道的权限');
    }

    const channel: GroupVoiceChannel = await group.createVoiceChannel({
      name,
      desc,
    });

    return channel;
  }
}

export default function GroupVoiceChannelDefinition(
  Sequelize: Orm,
  db: DBInstance
) {
  GroupVoiceChannel.init(
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      name: { type: Sequelize.STRING }, // 对应actor_actor的UUID
      desc: { type: Sequelize.STRING },
    },
    {
      tableName: 'group_voice_channel',
      sequelize: db,
    }
  );

  GroupVoiceChannel.belongsTo(GroupGroup, {
    foreignKey: 'groupId',
    as: 'group',
  });
  GroupGroup.hasMany(GroupVoiceChannel, {
    foreignKey: 'groupId',
    as: 'voiceChannels',
  });

  return GroupVoiceChannel;
}
