import { ModelAttributes, ModelOptions } from 'sequelize/types';
import { DBInstance, Orm, Model, TRPGModelAttributes } from 'trpg/core';

type ReportModelStruct = (Sequelize: Orm) => ModelAttributes;

/**
 * @deprecated use generateReportPackageModels()
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

interface ModelMapItem {
  init(...args: Parameters<typeof Model.init>): void;
}
interface ModelMap {
  daily: ModelMapItem;
  weekly: ModelMapItem;
  monthly: ModelMapItem;
}

type ModelMapScope = keyof ModelMap;

/**
 * 生成通过init初始化的脚本
 * @param prefix 前缀名
 * @param modelMap 模型map
 * @param struct 数据库结构生成
 */
export function generateReportPackageModels(
  prefix: string,
  modelMap: ModelMap,
  struct: ReportModelStruct
) {
  return ['daily', 'weekly', 'monthly'].map((scope: ModelMapScope) => {
    return (Sequelize: Orm, db: DBInstance) => {
      const Model = modelMap[scope];
      modelMap[scope].init(struct(Sequelize), {
        tableName: `${prefix}_${scope}`,
        sequelize: db,
      });

      return Model;
    };
  });
}
