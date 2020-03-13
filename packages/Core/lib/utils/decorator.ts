import { getGlobalApplication } from 'lib/application';
import _ from 'lodash';

type HashFn = (uuid: string) => string;
/**
 * 创建Redis缓存
 * 参数有且仅能有一个是UUID
 */
export function buildFindByUUIDCache(hashFn: HashFn) {
  return function(
    target: Object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<Function>
  ) {
    const ModelClass = target as any;
    const findByUUID = descriptor.value;

    if (!target.constructor) {
      throw new Error('this decorator should be a static function');
    }

    // if (!(target.constructor instanceof Model)) {
    //   throw new Error('this decorator is only use for TPRGModel class');
    // }

    if (propertyKey !== 'findByUUID') {
      throw new Error('this decorator is only use for findByUUID method');
    }

    descriptor.value = async (uuid: string) => {
      const trpgapp = getGlobalApplication();
      const cacheKey = hashFn(uuid);

      const cacheVal = await trpgapp.cache.get(cacheKey);

      if (_.isObject(cacheVal) && !_.isEmpty(cacheVal)) {
        // 应用缓存
        return new ModelClass(cacheVal, {
          isNewRecord: false,
        });
      } else {
        const data = await findByUUID.call(target, uuid);
        if (!_.isNil(data)) {
          // 仅不为空的时候记录缓存
          await trpgapp.cache.set(cacheKey, data); // 设置缓存
        }
        return data;
      }
    };
  };
}
