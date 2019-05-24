import SequelizeStatic from 'sequelize';
export { DBInstance } from '../lib/storage';

export type Orm = typeof SequelizeStatic;
