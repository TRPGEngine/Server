import {
  Model,
  Orm,
  DBInstance,
  BelongsToManyGetAssociationsMixin,
} from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';
import { GroupGroup } from 'packages/Group/lib/models/group';
import _ from 'lodash';

/**
 * 战报汇总
 */

declare module 'packages/Player/lib/models/user' {
  interface PlayerUser {
    getReports: BelongsToManyGetAssociationsMixin<TRPGGameReport>;
  }
}

export class TRPGGameReport extends Model {
  uuid: string;
  title: string;
  cast: string[];
  context: {};
  group_uuid: string;

  static async findByUUID(uuid: string): Promise<TRPGGameReport> {
    return TRPGGameReport.findOne({
      where: { uuid },
    });
  }

  /**
   * 获取团UUID下所有的战报
   * @param groupUUID 团UUID
   */
  static async findByGroupUUID(groupUUID: string): Promise<TRPGGameReport[]> {
    return TRPGGameReport.findAll({
      where: {
        group_uuid: groupUUID,
      },
      attributes: ['uuid', 'title', 'group_uuid'],
    });
  }

  /**
   * 生成游戏战报
   * @param playerUUID 创建者UUID
   * @param groupUUID 战报所在团的UUID
   * @param title 标题
   * @param cast 演员表
   * @param context 战报内容
   */
  static async generateGameReport(
    playerUUID: string,
    groupUUID: string,
    title: string,
    cast: string[],
    content: {}
  ): Promise<TRPGGameReport> {
    const user = await PlayerUser.findByUUID(playerUUID);
    if (_.isNil(user)) {
      throw new Error('找不到用户');
    }

    const group = await GroupGroup.findByUUID(groupUUID);
    if (_.isNil(user)) {
      throw new Error('找不到团');
    }

    if (!group.isManagerOrOwner(playerUUID)) {
      throw new Error('创建战报失败, 没有权限。');
    }

    const report = await TRPGGameReport.create({
      title,
      cast,
      content,
      group_uuid: groupUUID,
      ownerId: user.id,
    });

    return report;
  }

  /**
   * 删除团战报
   * @param reportUUID 战报UUID
   * @param playerUUID 操作人UUID
   * @param groupUUID 操作的团的UUID
   */
  static async deleteGameReport(
    reportUUID: string,
    playerUUID: string,
    groupUUID: string
  ) {
    const user = await PlayerUser.findByUUID(playerUUID);
    if (_.isNil(user)) {
      throw new Error('找不到用户');
    }

    const group = await GroupGroup.findByUUID(groupUUID);
    if (_.isNil(user)) {
      throw new Error('找不到团');
    }

    if (!group.isManagerOrOwner(playerUUID)) {
      throw new Error('删除战报失败, 没有权限。');
    }

    await TRPGGameReport.destroy({
      where: {
        uuid: reportUUID,
        group_uuid: groupUUID,
      },
      limit: 1,
    });
  }
}

export default function TRPGReportDefinition(Sequelize: Orm, db: DBInstance) {
  TRPGGameReport.init(
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      title: { type: Sequelize.STRING, allowNull: false },
      cast: { type: Sequelize.JSON, comment: '演员表' },
      content: { type: Sequelize.JSON, defaultValue: {} },
      group_uuid: { type: Sequelize.STRING },
    },
    {
      tableName: 'trpg_game_report',
      sequelize: db,
    }
  );

  TRPGGameReport.belongsTo(PlayerUser, { as: 'owner', foreignKey: 'ownerId' });
  PlayerUser.hasMany(TRPGGameReport, { as: 'reports', foreignKey: 'ownerId' });

  return TRPGGameReport;
}
