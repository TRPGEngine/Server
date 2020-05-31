import _isUUID from 'is-uuid';
import _isString from 'lodash/isString';

export function isUUID(str: string): boolean {
  return _isUUID.anyNonNil(str);
}

/**
 * 获取第一个空格后的所有字符串内容
 * @param str 字符串
 */
export function getStrAfterFirstBlank(str: string): string {
  if (!_isString(str)) {
    // 如果为非字符串输入。则输出空字符串确保输出类型永远是字符串
    return '';
  }

  const tmp = str.split(' ');

  if (tmp.length === 1) {
    // 没有空格，返回原始内容
    return str;
  } else {
    const [first, ...rest] = tmp;
    return rest.join(' ');
  }
}
