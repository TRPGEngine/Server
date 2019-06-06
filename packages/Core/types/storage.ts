import SequelizeStatic, {
  Model as SequelizeModel,
  ModelAttributes,
  InitOptions,
} from 'sequelize';
export { DBInstance, ModelFn, TRPGModel as Model } from '../lib/storage';

export type Orm = typeof SequelizeStatic;
