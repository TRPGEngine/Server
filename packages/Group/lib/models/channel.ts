import {
  Model,
  Orm,
  DBInstance,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  BelongsToGetAssociationMixin,
} from 'trpg/core';
import { GroupGroup } from './group';
import { PlayerUser } from 'packages/Player/lib/models/user';
import _ from 'lodash';
import { notifyUpdateGroupChannel } from '../notify';

declare module './group' {
  interface GroupGroup {
    createChannel: HasManyCreateAssociationMixin<GroupChannel>;
    getChannels: HasManyGetAssociationsMixin<GroupChannel>;
  }
}

/**
 * 一个群组可以有多个频道
 */
export class GroupChannel extends Model {
  uuid: string;
  name: string;
  desc: string;
  members: string[];

  groupId?: number;

  getGroup?: BelongsToGetAssociationMixin<GroupGroup>;

  static findByUUID(uuid: string): Promise<GroupChannel> {
    return GroupChannel.findOne({
      where: {
        uuid,
      },
    });
  }

  /**
   *
   * @param groupUUID 所属团UUID
   * @param playerUUID 操作人UUID
   * @param name 频道名
   * @param desc 频道描述
   * @param memberUUIDs 初始成员UUID
   */
  static async createChannel(
    groupUUID: string,
    playerUUID: string,
    name: string,
    desc: string,
    memberUUIDs?: string[]
  ): Promise<GroupChannel> {
    const group = await GroupGroup.findByUUID(groupUUID);
    if (!group.isManagerOrOwner(playerUUID)) {
      throw new Error('没有创建频道的权限');
    }

    if (_.isEmpty(memberUUIDs)) {
      memberUUIDs = [playerUUID];
    } else {
      if (!memberUUIDs.includes(playerUUID)) {
        memberUUIDs.push(playerUUID);
      }
    }

    const channel: GroupChannel = await group.createChannel({
      name,
      desc,
      members: _.uniq(memberUUIDs),
    });

    notifyUpdateGroupChannel(group); // 通知更新团的channels列表

    return channel;
  }

  /**
   * 增加频道成员
   * @param channelUUID 团UUID
   * @param playerUUID 操作人UUID
   * @param memberUUIDs 成员UUID
   */
  static async addMember(
    channelUUID: string,
    playerUUID: string,
    memberUUIDs: string[]
  ): Promise<void> {
    const channel = await GroupChannel.findByUUID(channelUUID);
    if (_.isNil(channel)) {
      throw new Error('找不到该频道');
    }

    const group: GroupGroup = await channel.getGroup();
    if (_.isNil(group)) {
      throw new Error('数据异常, 找不到频道归属的团');
    }

    if (!group.isManagerOrOwner(playerUUID)) {
      throw new Error('没有操作权限');
    }

    channel.members = _.uniq([...channel.members, ...memberUUIDs]);

    await channel.save();

    // 加入房间
    const trpgapp = GroupChannel.getApplication();
    trpgapp.player.manager.joinRoomWithUUIDs(channel.uuid, channel.members);
  }

  /**
   * 移除频道成员
   * @param channelUUID 团UUID
   * @param playerUUID 操作人UUID
   * @param memberUUIDs 成员UUID
   */
  static async removeMember(
    channelUUID: string,
    playerUUID: string,
    memberUUIDs: string[]
  ): Promise<void> {
    const channel = await GroupChannel.findByUUID(channelUUID);
    if (_.isNil(channel)) {
      throw new Error('找不到该频道');
    }

    const group: GroupGroup = await channel.getGroup();
    if (_.isNil(group)) {
      throw new Error('数据异常, 找不到频道归属的团');
    }

    if (!group.isManagerOrOwner(playerUUID)) {
      throw new Error('没有操作权限');
    }

    channel.members = _.without(channel.members, ...memberUUIDs);

    if (_.isEmpty(channel.members)) {
      // 如果频道成员为空，直接就地解散
      await channel.destroy();
    } else {
      await channel.save();
    }

    notifyUpdateGroupChannel(group);

    // 离开房间
    const trpgapp = GroupChannel.getApplication();
    trpgapp.player.manager.leaveRoomWithUUIDs(channel.uuid, channel.members);
  }
}

export default function GroupChannelDefinition(Sequelize: Orm, db: DBInstance) {
  GroupChannel.init(
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      name: { type: Sequelize.STRING }, // 对应actor_actor的UUID
      desc: { type: Sequelize.STRING },
      members: { type: Sequelize.JSON, defaultValue: [] },
    },
    {
      tableName: 'group_channel',
      sequelize: db,
    }
  );

  GroupChannel.belongsTo(GroupGroup, {
    foreignKey: 'groupId',
    as: 'group',
  });
  GroupGroup.hasMany(GroupChannel, {
    foreignKey: 'groupId',
    as: 'channels',
  });

  GroupChannel.belongsTo(PlayerUser, {
    foreignKey: 'ownerId',
    as: 'owner',
  });

  return GroupChannel;
}
