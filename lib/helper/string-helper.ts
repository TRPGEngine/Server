import _isUUID from 'is-uuid';
import _isString from 'lodash/isString';
import randomString from 'crypto-random-string';

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

/**
 * 判断输入是否为有值的字符串
 * @param str 输入
 */
export function hasString(str: any): boolean {
  return _isString(str) && str !== '';
}

/**
 * 字符串根据数量分组
 * @param str 字符串
 * @param step 数量
 */
export function groupString(str: string, step: number): string[] {
  const r: string[] = [];
  function doGroup(s: string) {
    if (!s) return;
    r.push(s.substr(0, step));
    s = s.substr(step);
    doGroup(s);
  }
  doGroup(str);
  return r;
}

/**
 * 生成随机字符串
 * @param length 随机字符串长度
 */
export function generateRandomStr(length = 10): string {
  return randomString(length);
}

/**
 * 尝试解析json并返回解析后的值
 */
export function tryParseJSON(json: string): any {
  try {
    return JSON.parse(json);
  } catch (e) {
    return json;
  }
}
