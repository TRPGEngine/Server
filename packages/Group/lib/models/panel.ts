import { Model, Orm, DBInstance, HasManyGetAssociationsMixin } from 'trpg/core';
import { GroupGroup } from 'packages/Group/lib/models/group';
import _ from 'lodash';

/**
 * 团面板
 */

declare module './group' {
  interface GroupGroup {
    getGroupPanels?: HasManyGetAssociationsMixin<GroupPanel>;
  }
}

export type GroupPanelType =
  | 'channel' // 文字聊天频道
  | 'richtext' // 富文本
  | 'voicechannel' // 语音聊天频道
  | 'map' // 地图
  | 'actors' // 团角色
  | 'kanban'; // 看板

export class GroupPanel extends Model {
  id: string;
  uuid: string;
  name: string;
  type: GroupPanelType;
  target_uuid: string;
  color: string; // panel文本颜色
  order: number;

  static async createPanel(
    name: string,
    type: GroupPanelType
  ): Promise<GroupPanel> {
    const groupPanel = await GroupPanel.create({
      name,
      type,
    });

    return groupPanel;
  }

  /**
   * 获取团所有的面板
   * @param groupUUID 团UUID
   */
  static async getPanelByGroup(group: GroupGroup): Promise<GroupPanel[]> {
    const panels: GroupPanel[] = await group.getGroupPanels();

    return _.orderBy(panels, 'order', 'asc');
  }
}

export default function GroupPanelDefinition(Sequelize: Orm, db: DBInstance) {
  GroupPanel.init(
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
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
    }
  );

  GroupPanel.belongsTo(GroupGroup, {
    foreignKey: 'groupId',
    as: 'group',
  });
  GroupGroup.hasMany(GroupPanel, {
    foreignKey: 'groupId',
    as: 'groupPanels',
  });

  return GroupPanel;
}
