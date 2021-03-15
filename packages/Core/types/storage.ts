import SequelizeStatic, {
  Model as SequelizeModel,
  ModelAttributes,
  InitOptions,
  Op,
} from 'sequelize';
export {
  DBInstance,
  ModelFn,
  TRPGModel as Model,
  TRPGModelAttributes,
} from '../lib/storage';

export type Orm = typeof SequelizeStatic;
export { Op };
