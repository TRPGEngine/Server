import {
  Model,
  Orm,
  DBInstance,
  BelongsToManyGetAssociationsMixin,
} from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';

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
    const report = await TRPGGameReport.create({
      title,
      cast,
      content,
      group_uuid: groupUUID,
      ownerId: user.id,
    });

    return report;
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
