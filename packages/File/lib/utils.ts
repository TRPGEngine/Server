/**
 * 将字符串转化为数字
 * @param str 字符串
 */
export const encodeStr2Int = function(str: string): number {
  try {
    return str
      .split('')
      .map((c) => c.charCodeAt(0))
      .reduce((a, b) => a + b);
  } catch (err) {
    console.error('encodeStr2Int error:', err);
    return 0;
  }
};
