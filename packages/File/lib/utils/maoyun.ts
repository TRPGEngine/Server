import axios from 'axios';
import crypto from 'crypto';
import _ from 'lodash';
import config from 'config';

const domain = _.get(config, 'file.oss.maoyun.domain', '');
const appId = _.get(config, 'file.oss.maoyun.appId', '');
const appSecret = _.get(config, 'file.oss.maoyun.appSecret', '');
const bucketId = _.get(config, 'file.oss.maoyun.bucketId', '');

/**
 * 生成签名字符串
 * @param method 方法
 * @param params 参数
 */
export function sign(method: 'GET' | 'POST', params: {}): string {
  const paramsStr = Object.entries(params)
    .map(([key, val]) => `${key}=${val}`)
    .join('&');

  const stringToSign =
    method.toUpperCase() +
    '&' +
    encodeURIComponent('/') +
    '&' +
    encodeURIComponent(paramsStr);

  const signature = crypto
    .createHmac('sha1', appSecret)
    .update(stringToSign)
    .digest('base64');

  return encodeURIComponent(signature);
}

export async function getToken() {
  await axios.post('http://mos.api.maoyuncloud.cn/api/user/getToken');
}

// export async function getBucketInfo() {
//   return axios.get()
// }

/**
 * 获取临时上传授权
 */
export async function getUploadToken(key: string) {
  const { data } = await axios.get(
    'http://api.catmos.maoyuncloud.cn/zyc/object/token',
    {
      params: {
        name: bucketId,
        url: `/${key}`,
      },
      headers: {
        Action: 'GetObjectToken',
      },
    }
  );

  return data;
}

/**
 * 通过文件buffer上传文件
 * @param key 上传文件路径， 前缀不包含/
 * @param buffer 文件Buffer
 */
export async function uploadFileWithBuffer(key: string, buffer: Buffer) {
  key = encodeURI(key);
  const uploadToken = await getUploadToken(key);
  const { data } = await axios.put(`${domain}/${key}`, buffer, {
    headers: {
      Authorization: uploadToken,
    },
  });

  return data;
}
