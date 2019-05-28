import SequelizeStatic from 'sequelize';
export { DBInstance, ModelFn } from '../lib/storage';

export type Orm = typeof SequelizeStatic;
export type Model = SequelizeStatic.Model;
