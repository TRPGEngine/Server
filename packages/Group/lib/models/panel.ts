import { Model, Orm, DBInstance, HasManyGetAssociationsMixin } from 'trpg/core';
import { GroupGroup } from 'packages/Group/lib/models/group';
import _ from 'lodash';
import { GroupChannel } from './channel';
import { notifyUpdateGroupPanel } from '../notify';

/**
 * 团面板
 */

declare module './group' {
  interface GroupGroup {
    getPanels?: HasManyGetAssociationsMixin<GroupPanel>;
  }
}

export type GroupPanelType =
  | 'channel' // 文字聊天频道
  | 'richtext' // 富文本
  | 'voicechannel' // 语音聊天频道
  | 'map' // 地图
  | 'actors' // 团角色
  | 'kanban'; // 看板

interface GroupPanelDestroyTargetRecordOptions {
  force?: boolean;
}

export class GroupPanel extends Model {
  id: string;
  uuid: string;
  name: string;
  type: GroupPanelType;
  target_uuid: string;
  color: string; // panel文本颜色
  order: number;

  groupId?: number;

  static defaultOrder = 'asc' as const;

  /**
   * 创建面板
   * @param name 面板名
   * @param type 面板类型
   * @param groupUUID 团UUID
   * @param userUUID 创建人UUID
   */
  static async createPanel(
    name: string,
    type: GroupPanelType,
    groupUUID: string,
    userUUID: string
  ): Promise<{ groupPanel: GroupPanel; other: any }> {
    const group = await GroupGroup.findByUUID(groupUUID);
    const groupId = group.id;

    // 检测权限
    if (!group.isManagerOrOwner(userUUID)) {
      throw new Error('创建失败: 你没有权限创建面板');
    }

    const maxOrder = await GroupPanel.max('order', {
      where: {
        groupId,
      },
    });

    const other: any = {};
    let target_uuid: string = undefined;
    if (type === 'channel') {
      // 如果是文字类型则新建文字类型
      const channel = await GroupChannel.createChannel(
        groupUUID,
        userUUID,
        name,
        name
      );
      other.groupChannel = channel;
      target_uuid = channel.uuid;
    }

    const groupPanel = await GroupPanel.create({
      name,
      type,
      target_uuid,
      order: maxOrder + 1, // 确保新加的panel顺序在最后
      groupId,
    });

    await notifyUpdateGroupPanel(group);

    return { groupPanel, other };
  }

  /**
   * 获取团所有的面板
   * @param groupUUID 团UUID
   */
  static async getPanelByGroup(group: GroupGroup): Promise<GroupPanel[]> {
    const panels: GroupPanel[] = await group.getPanels();

    return _.orderBy(panels, 'order', GroupPanel.defaultOrder);
  }

  /**
   * 更新团面板order
   * @param groupUUID 团UUID
   * @param userUUID 操作人UUID
   * @param panelOrderList 更新团面板order列表
   */
  static async updateGroupPanelOrder(
    groupUUID: string,
    userUUID: string,
    panelOrderList: { uuid: string; order: number }[]
  ): Promise<number> {
    const group = await GroupGroup.findByUUID(groupUUID);

    // 检测权限
    if (!group.isManagerOrOwner(userUUID)) {
      throw new Error('创建失败: 你没有权限创建面板');
    }

    const groupPanels = await GroupPanel.getPanelByGroup(group);
    const allAllowPanelUUIDs = groupPanels.map((panel) => panel.uuid);

    // 手动处理一遍确保不会有额外的参数
    panelOrderList = panelOrderList.map((item) =>
      _.pick(item, ['uuid', 'order'])
    );

    // 仅保留在团里的面板列表
    // 不在团里的直接过滤掉
    const validatedGroupOrderList = panelOrderList.filter(({ uuid }) =>
      allAllowPanelUUIDs.includes(uuid)
    );

    const affectedRowList = await Promise.all(
      validatedGroupOrderList.map(({ uuid, order }) => {
        return GroupPanel.update(
          {
            order,
          },
          {
            where: {
              uuid,
              groupId: group.id,
            },
          }
        );
      })
    );

    let affectedRow = 0;
    for (const row of affectedRowList) {
      affectedRow += Number(row);
    }

    // 通知用户更新团面板
    await notifyUpdateGroupPanel(group);

    return affectedRow;
  }

  /**
   * 删除目标记录
   */
  async destroyTargetRecord(options: GroupPanelDestroyTargetRecordOptions) {
    const type = this.type;
    const targetUUID = this.target_uuid;

    if (type === 'channel') {
      await GroupChannel.destroy({
        where: {
          uuid: targetUUID,
        },
        ...options,
      });
    }
  }
}

export default function GroupPanelDefinition(Sequelize: Orm, db: DBInstance) {
  GroupPanel.init(
    {
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
        unique: true,
      },
      name: { type: Sequelize.STRING, required: true },
      type: { type: Sequelize.STRING, required: true },
      target_uuid: {
        type: Sequelize.STRING,
        comment: '根据类型指向不同的模型的UUID',
      },
      color: { type: Sequelize.STRING(24) },
      order: { type: Sequelize.INTEGER, defaultValue: 0 },
    },
    {
      tableName: 'group_panel',
      sequelize: db,
      paranoid: true,
      hooks: {
        async afterDestroy(ins, options) {
          // 删除时自动清理目标记录
          await ins.destroyTargetRecord({
            force: options.force,
          });
        },
      },
    }
  );

  GroupPanel.belongsTo(GroupGroup, {
    foreignKey: 'groupId',
    as: 'group',
  });
  GroupGroup.hasMany(GroupPanel, {
    foreignKey: 'groupId',
    as: 'panels',
  });

  return GroupPanel;
}
