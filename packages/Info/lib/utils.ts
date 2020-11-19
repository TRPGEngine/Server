import urlRegex from 'url-regex';

/**
 * 判定一个地址是否是一个合法的url
 * @param url 要检测的Url
 */
export function isUrl(url: string): boolean {
  return urlRegex({ exact: true, strict: true }).test(url);
}
