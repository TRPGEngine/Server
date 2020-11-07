import _ from 'lodash';

interface LeafItem {
  path: string;
  value: any;
}

/**
 * 获取一个对象的所有叶子节点
 * @param obj 数据
 */
export function getObjectLeaf(obj: any, prefix = ''): LeafItem[] {
  if (typeof obj !== 'object') {
    if (prefix === '') {
      return [
        {
          path: '',
          value: obj,
        },
      ];
    }

    return {
      path: prefix,
      value: obj,
    } as any;
  } else {
    return _.flatten(
      _.toPairs(obj).map(([key, value]) => {
        const _key = prefix === '' ? key : [prefix, key].join('.');

        return getObjectLeaf(value, _key);
      })
    );
  }
}
