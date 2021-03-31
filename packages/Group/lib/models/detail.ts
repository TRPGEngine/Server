import {
  Orm,
  DBInstance,
  Model,
  HasOneGetAssociationMixin,
  BelongsToCreateAssociationMixin,
} from 'trpg/core';
import { ChatMessagePayload } from 'packages/Chat/types/message';
import { GroupGroup } from './group';
import _ from 'lodash';
import { notifyUpdateGroupInfo } from '../notify';

declare module './group' {
  interface GroupGroup {
    getDetail?: HasOneGetAssociationMixin<GroupDetail>;
    createDetail?: BelongsToCreateAssociationMixin<GroupDetail>;
  }
}

/**
 * 生成团详细信息的UUID
 * @param uuid 团UUID
 */
export const genGroupDetailCacheKey = (uuid: string): string =>
  `group:detail:info:${uuid}`;

export class GroupDetail extends Model {
  id: number;
  master_name: string; // 主持人称呼: 守密人， 地下城主, ...
  disable_check_actor: boolean; // 是否禁止普通用户查看团人物卡信息(所有人物卡)
  disable_check_actor_in_chat: boolean; // 是否禁止普通用户查看聊天界面中出现的团人物卡
  background_image_url: string; // 团聊天背景URL
  welcome_msg_payload: ChatMessagePayload; // 新用户欢迎信息
  disable_quick_dice: boolean;

  groupId?: number;

  /**
   * 保存团详情信息
   * @param groupUUID 团UUID
   * @param playerUUID 操作人UUID
   * @param data 要保存的详情内容
   */
  static async saveGroupDetail(
    groupUUID: string,
    playerUUID: string,
    data: PartialModelField<GroupDetail>
  ): Promise<GroupDetail> {
    if (_.isEmpty(data)) {
      throw new Error('缺少数据');
    }

    const group = await GroupGroup.findByUUID(groupUUID);
    if (!group.isManagerOrOwner(playerUUID)) {
      throw new Error('没有操作权限');
    }

    let detail: GroupDetail = await group.getDetail();

    if (_.isNil(detail)) {
      // 没有详情则创建详情
      detail = await group.createDetail({});
    }

    for (const key in data) {
      const val = data[key];
      detail[key] = val;
    }

    await detail.save();

    const trpgapp = GroupDetail.getApplication();
    const cacheKey = genGroupDetailCacheKey(groupUUID);
    await trpgapp.cache.set(cacheKey, detail); // 设置缓存

    notifyUpdateGroupInfo(groupUUID, group);

    return detail;
  }

  /**
   * 获取团详细信息
   */
  static async getGroupDetail(groupUUID: string): Promise<GroupDetail> {
    const cacheKey = genGroupDetailCacheKey(groupUUID);
    const trpgapp = GroupDetail.getApplication();
    const cacheVal = await trpgapp.cache.get(cacheKey);

    if (_.isObject(cacheVal) && !_.isEmpty(cacheVal)) {
      // 应用缓存
      return new GroupDetail(cacheVal, {
        isNewRecord: false,
      });
    } else {
      const group = await GroupGroup.findByUUID(groupUUID);
      const detail: GroupDetail = await group.getDetail();
      if (!_.isNil(detail)) {
        // 仅不为空的时候记录缓存
        await trpgapp.cache.set(cacheKey, detail); // 设置缓存
      }
      return detail;
    }
  }
}

export default function GroupDetailDefinition(Sequelize: Orm, db: DBInstance) {
  /**
   * 注意: 每个团不一定有detail。只有设置后才有detail。因此所有的默认值应当为空或者false之类无信息的值
   */
  GroupDetail.init(
    {
      master_name: {
        type: Sequelize.STRING,
        defaultValue: '主持人',
      },
      disable_check_actor: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: '是否禁止查看人物卡, 用于秘密团',
      },
      disable_check_actor_in_chat: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: '是否禁止查看会话中人物卡, 用于秘密团',
      },
      background_image_url: {
        type: Sequelize.STRING,
      },
      welcome_msg_payload: {
        type: Sequelize.JSON,
      },
      disable_quick_dice: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'group_detail',
      sequelize: db,
    }
  );

  GroupDetail.belongsTo(GroupGroup, { as: 'group', foreignKey: 'groupId' });
  GroupGroup.hasOne(GroupDetail, { as: 'detail', foreignKey: 'groupId' });

  return GroupDetail;
}
