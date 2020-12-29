import _ from 'lodash';
import {
  Model,
  Orm,
  DBInstance,
  BelongsToGetAssociationMixin,
} from 'trpg/core';
import { GroupPanel } from './panel';

/**
 * 一个通用的团面板数据存储模型
 */
export class GroupPanelData extends Model {
  id: number;
  group_uuid: string;
  data: any;

  getPanel?: BelongsToGetAssociationMixin<GroupPanel>;

  /**
   * 设置团面板数据
   */
  static async setGroupPanelData(
    groupUUID: string,
    data: object
  ): Promise<void> {
    await GroupPanelData.upsert({
      group_uuid: groupUUID,
      data,
    });
  }

  /**
   * 获取团面板数据
   */
  static async getGroupPanelData(groupUUID: string): Promise<object> {
    const ret = await GroupPanelData.findOne({
      where: {
        group_uuid: groupUUID,
      },
    });

    return ret.data;
  }
}

export default function GroupPanelDataDefinition(
  Sequelize: Orm,
  db: DBInstance
) {
  GroupPanelData.init(
    {
      group_uuid: { type: Sequelize.STRING, allowNull: false, unique: true },
      data: { type: Sequelize.JSON },
    },
    {
      tableName: 'group_panel_data',
      sequelize: db,
      paranoid: true,
    }
  );

  GroupPanelData.belongsTo(GroupPanel, {
    foreignKey: 'panelId',
    as: 'panel',
  });
  GroupPanel.hasOne(GroupPanelData, {
    foreignKey: 'panelId',
    as: 'panelData',
  });

  return GroupPanel;
}
