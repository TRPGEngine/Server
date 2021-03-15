import { ModelAttributes, ModelOptions } from 'sequelize/types';
import { DBInstance, Orm } from 'trpg/core';

type ReportModelStruct = (Sequelize: Orm) => ModelAttributes;

/**
 * 生成Report模型
 */
export function generateReportModels(
  name: string,
  struct: ReportModelStruct,
  options: ModelOptions
) {
  return {
    daily(Sequelize: Orm, db: DBInstance) {
      return db.define(name + '_daily', struct(Sequelize), options);
    },
    weekly(Sequelize: Orm, db: DBInstance) {
      return db.define(name + '_weekly', struct(Sequelize), options);
    },
    monthly(Sequelize: Orm, db: DBInstance) {
      return db.define(name + '_monthly', struct(Sequelize), options);
    },
  };
}
