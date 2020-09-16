import {
  Model,
  Orm,
  DBInstance,
  HasManyGetAssociationsMixin,
  BelongsToGetAssociationMixin,
} from 'trpg/core';
import { GroupGroup } from 'packages/Group/lib/models/group';
import _ from 'lodash';
import { GroupChannel } from './channel';
import { notifyUpdateGroupPanel } from '../notify';
import {
  GroupPanelDestroyTargetRecordOptions,
  handleGroupPanelCreate,
  handleGroupPanelDestroy,
} from '../panels/reg';

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
  | 'note' // 团笔记
  | 'voicechannel' // 语音聊天频道
  | 'map' // 地图
  | 'actors' // 团角色
  | 'kanban' // 看板
  | 'test'; // 测试类型

export class GroupPanel extends Model {
  id: string;
  uuid: string;
  name: string;
  type: GroupPanelType;
  target_uuid: string;
  color: string; // panel文本颜色
  order: number;

  groupId?: number;

  getGroup?: BelongsToGetAssociationMixin<GroupGroup>;

  static defaultOrder = 'asc' as const;

  static async findByUUID(panelUUID: string): Promise<GroupPanel | null> {
    const panel = await GroupPanel.findOne({
      where: {
        uuid: panelUUID,
      },
    });

    return panel;
  }

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
    extra: any,
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

    // 根据类型进行对应的创建操作
    const { targetUUID, other } = await handleGroupPanelCreate(type, {
      name,
      type,
      extra,
      groupUUID,
      userUUID,
    });

    const groupPanel = await GroupPanel.create({
      name,
      type,
      target_uuid: targetUUID,
      order: maxOrder + 1, // 确保新加的panel顺序在最后
      groupId,
    });

    await notifyUpdateGroupPanel(group);

    return { groupPanel, other };
  }

  /**
   * 删除面板
   */
  static async removePanel(panelUUID: string, userUUID: string): Promise<void> {
    const panel = await GroupPanel.findByUUID(panelUUID);
    if (_.isNil(panel)) {
      throw new Error('找不到面板');
    }

    const group: GroupGroup = await panel.getGroup();
    if (_.isNil(group)) {
      throw new Error('找不到关联的团');
    }
    if (!group.isManagerOrOwner(userUUID)) {
      throw new Error('删除失败: 你没有权限移除面板');
    }

    await panel.destroy(); // 面板删除后会自动调用hook来触发destroyTargetRecord

    await notifyUpdateGroupPanel(group);
  }

  /**
   * 更新团信息
   * @param panelUUID 团面板UUID
   * @param userUUID 操作用户UID
   * @param newData 新的参数
   */
  static async updatePanelInfo(
    panelUUID: string,
    userUUID: string,
    newData: object
  ): Promise<GroupPanel> {
    const allowedInfo = ['name'];

    newData = _.pick(newData, allowedInfo);

    const panel = await GroupPanel.findByUUID(panelUUID);
    if (_.isNil(panel)) {
      throw new Error('找不到该面板');
    }

    const group: GroupGroup = await panel.getGroup();
    if (_.isNil(group)) {
      throw new Error('找不到团');
    }

    const isManager = group.isManagerOrOwner(userUUID);
    if (!isManager) {
      throw new Error('无权限修改团面板信息');
    }

    await panel.update(newData);

    await notifyUpdateGroupPanel(group);

    return panel;
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

    await handleGroupPanelDestroy(type, this, options);
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
