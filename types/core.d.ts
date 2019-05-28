export { TRPGApplication } from '../packages/Core/types/app';
export {
  Orm,
  DBInstance,
  Model,
  ModelFn,
} from '../packages/Core/types/storage';

declare interface ModelAttributeColumnOptions {
  required?: boolean;
}
