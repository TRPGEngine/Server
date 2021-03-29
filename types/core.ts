export { TRPGApplication, ScheduleJobFn } from 'packages/Core/types/app';
export {
  Orm,
  DBInstance,
  Model,
  ModelFn,
  Op,
  ModelLiteral,
  TRPGModelAttributes,
} from 'packages/Core/types/storage';
export { SocketEventFn, EventFunc, Socket } from 'packages/Core/types/socket';
export { CacheValue } from 'packages/Core/types/cache';
export { TRPGRouter, TRPGMiddleware } from 'packages/Core/types/webservice';

export {
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
  HasOneGetAssociationMixin,
  HasOneSetAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManySetAssociationsMixin,
  HasManyCreateAssociationMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToManyHasAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyCountAssociationsMixin,
} from 'sequelize';

// 模型权限信息
export interface ModelAccess {
  editable: boolean; // 可编辑
  removeable: boolean; // 可删除
}
