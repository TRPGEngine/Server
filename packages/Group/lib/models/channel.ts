import {
  Model,
  Orm,
  DBInstance,
  HasManyCreateAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyGetAssociationsMixin,
  HasManyGetAssociationsMixin,
} from 'trpg/core';
import { GroupGroup } from './group';
import { PlayerUser } from 'packages/Player/lib/models/user';
import _ from 'lodash';
import { notifyUpdateGroupInfo } from '../notify';

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

  groupId?: number;

  addMembers?: BelongsToManyAddAssociationsMixin<PlayerUser, number>;
  getMembers?: BelongsToManyGetAssociationsMixin<PlayerUser>;

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

    const channel: GroupChannel = await group.createChannel({
      name,
      desc,
    });

    if (_.isEmpty(memberUUIDs)) {
      memberUUIDs = [playerUUID];
    } else {
      if (!memberUUIDs.includes(playerUUID)) {
        memberUUIDs.push(playerUUID);
      }
    }

    const players = await Promise.all(
      _.uniq(memberUUIDs).map((uuid) => PlayerUser.findByUUID(uuid))
    );
    await channel.addMembers(players);

    // 通知更新团信息
    const channels = await group.getChannels();
    notifyUpdateGroupInfo(group.uuid, { channels }); // 通知更新团的channels列表

    return channel;
  }
}

export default function GroupChannelDefinition(Sequelize: Orm, db: DBInstance) {
  GroupChannel.init(
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      name: { type: Sequelize.STRING }, // 对应actor_actor的UUID
      desc: { type: Sequelize.STRING },
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

  GroupChannel.belongsToMany(PlayerUser, {
    through: 'group_channel_member',
    as: 'members',
  });

  return GroupChannel;
}
