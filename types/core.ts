export { TRPGApplication, ScheduleJobFn } from 'packages/Core/types/app';
export {
  Orm,
  DBInstance,
  Model,
  ModelFn,
  Op,
} from 'packages/Core/types/storage';
export { SocketEventFn, EventFunc, Socket } from 'packages/Core/types/socket';
export { CacheValue } from 'packages/Core/types/cache';
export { TRPGRouter, TRPGMiddleware } from 'packages/Core/types/webservice';

export {
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManySetAssociationsMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyHasAssociationsMixin,
} from 'sequelize';

// 模型权限信息
export interface ModelAccess {
  editable: boolean; // 可编辑
  removeable: boolean; // 可删除
}
