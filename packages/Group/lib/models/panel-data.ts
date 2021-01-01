import _ from 'lodash';
import { GroupGroup } from 'packages/Group/lib/models/group';
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
  /**
   * 设置团面板数据
   * @param groupUUID
   * @param data
   * @param operatorUUID
   */
  static async setGroupPanelData(
    groupPanelUUID: string,
    data: object,
    operatorUUID: string
  ): Promise<void> {
    const groupPanel = await GroupPanel.findByUUID(groupPanelUUID);
    if (_.isNil(groupPanel)) {
      throw new Error('未找到要修改数据的面板');
    }

    const group: GroupGroup = await groupPanel.getGroup();
    if (_.isNil(group)) {
      throw new Error('未找到要修改面板数据的团');
    }

    if (!group.isManagerOrOwner(operatorUUID)) {
      throw new Error('没有修改权限');
    }

    await GroupPanelData.upsert({
      group_panel_uuid: groupPanelUUID,
      data,
      panelId: groupPanel.id,
    });
  }

  /**
   * 获取团面板数据
   */
  static async getGroupPanelData(groupPanelUUID: string): Promise<object> {
    const ret = await GroupPanelData.findOne({
      where: {
        group_panel_uuid: groupPanelUUID,
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
      group_panel_uuid: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      data: { type: Sequelize.JSON },
    },
    {
      tableName: 'group_panel_data',
      sequelize: db,
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
