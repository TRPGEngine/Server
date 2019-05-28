export { TRPGApplication } from '../packages/Core/types/app';
export {
  Orm,
  DBInstance,
  Model,
  ModelFn,
} from '../packages/Core/types/storage';
export { SocketEventFn } from '../packages/Core/types/socket';

declare interface ModelAttributeColumnOptions {
  required?: boolean;
}
