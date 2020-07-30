import { Model, Orm, DBInstance } from 'trpg/core';
import { GroupGroup } from 'packages/Group/lib/models/group';

/**
 * 团面板
 */

export type GroupPanelType =
  | 'channel' // 文字聊天频道
  | 'richtext' // 富文本
  | 'voicechannel' // 语音聊天频道
  | 'map' // 地图
  | 'actors'; // 团角色

export class GroupPanel extends Model {
  id: string;
  uuid: string;
  name: string;
  type: GroupPanelType;
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
}

export default function GroupPanelDefinition(Sequelize: Orm, db: DBInstance) {
  GroupPanel.init(
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      name: { type: Sequelize.STRING, required: true },
      type: { type: Sequelize.STRING, required: true },
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
    as: 'groupPanel',
  });

  return GroupPanel;
}
