import _ from 'lodash';

/**
 * 监听事件的触发
 * 当事件触发后会将事件的返回结果作为参数触发onFire的回调函数
 * 该方法会返回一个包装后的方法, 该方法应当替换原来的方法
 */
interface FunctionWrapFireParams {
  result: any;
  args: any[];
}
export function buildWatchFunctionWrapAsync(
  fn: Function,
  onFire: (ctx: FunctionWrapFireParams) => void
): any {
  if (!_.isFunction(fn)) {
    console.warn('监听失败, 监听的函数应当为一个方法');
    return fn;
  }

  return async (...args) => {
    const ret = await fn(...args);
    try {
      // 此处不使用await
      onFire({
        result: ret,
        args,
      });
    } finally {
      return ret;
    }
  };
}
