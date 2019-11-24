export { sleep } from 'lib/helper/utils';
import randomString from 'crypto-random-string';

/**
 * 生成随机字符串
 * @param length 长度, 默认0
 */
export const generateRandomStr = (length = 10) => {
  return randomString(length);
};
