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

export const getGroupChannelGroupUUIDCacheKey = (uuid: string): string =>
  `group:channel:${uuid}:groupUUID`;

/**
 * 一个群组可以有多个频道
 */
export class GroupChannel extends Model {
  uuid: string;
  name: string;
  desc: string;

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
   * @param operatorUserUUID 操作人UUID
   * @param name 频道名
   * @param desc 频道描述
   */
  static async createChannel(
    groupUUID: string,
    operatorUserUUID: string,
    name: string,
    desc: string
  ): Promise<GroupChannel> {
    const group = await GroupGroup.findByUUID(groupUUID);
    if (!group.isManagerOrOwner(operatorUserUUID)) {
      throw new Error('没有创建频道的权限');
    }

    const channel: GroupChannel = await group.createChannel({
      name,
      desc,
    });

    notifyUpdateGroupChannel(group); // 通知更新团的channels列表

    return channel;
  }

  /**
   * 获取频道所在团的UUID
   * 用于获取频道转发的房间号
   */
  static async getChannelGroupUUID(channelUUID: string): Promise<string> {
    const cacheKey = getGroupChannelGroupUUIDCacheKey(channelUUID);
    const app = PlayerUser.getApplication();
    const cacheVal = await app.cache.get(cacheKey);
    if (_.isString(cacheVal)) {
      // 使用缓存
      return cacheVal;
    } else {
      const channel = await GroupChannel.findByUUID(channelUUID);
      if (_.isNil(channel)) {
        throw new Error('找不到相关频道');
      }
      const group: GroupGroup = await channel.getGroup();
      if (_.isNil(group)) {
        throw new Error('找不到相关团');
      }

      const groupUUID = group.uuid;
      if (!_.isString(groupUUID)) {
        throw new Error('无法正确获取到团UUID');
      }

      await app.cache.set(cacheKey, groupUUID); // 设置缓存
      return group.uuid;
    }
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

  return GroupChannel;
}
