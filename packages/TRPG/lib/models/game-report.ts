import { Model, Orm, DBInstance } from 'trpg/core';

/**
 * 战报汇总
 */

export class TRPGGameReport extends Model {
  uuid: string;
  title: string;
  cast: string[];
  context: {};

  static async findByUUID(uuid: string): Promise<TRPGGameReport> {
    return TRPGGameReport.findOne({
      where: { uuid },
    });
  }

  /**
   * 生成游戏战报
   * @param title 标题
   * @param cast 演员表
   * @param context 战报内容
   */
  static async generateGameReport(
    title: string,
    cast: string[],
    content: {}
  ): Promise<TRPGGameReport> {
    return TRPGGameReport.create({
      title,
      cast,
      content,
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
    },
    {
      tableName: 'trpg_game_report',
      sequelize: db,
    }
  );

  return TRPGGameReport;
}
