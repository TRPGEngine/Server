import qiniu from 'qiniu';
import config from 'config';
import _ from 'lodash';

const accessKey = _.get(config, 'file.oss.qiniu.accessKey', '');
const secretKey = _.get(config, 'file.oss.qiniu.secretKey', '');
export const bucket = _.get(config, 'file.oss.qiniu.bucket', '');

const qiniuConfig = new qiniu.conf.Config({
  zone: qiniu.zone.Zone_z0,
});
const formUploader = new qiniu.form_up.FormUploader(qiniuConfig);
const bucketManager = new qiniu.rs.BucketManager(genMac(), config);

export function genMac(): qiniu.auth.digest.Mac {
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
  return mac;
}

/**
 * 生成上传Token
 */
export function genUploadToken(): string {
  const options = {
    scope: bucket,
    returnBody:
      '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"mimeType":"$(mimeType)","bucket":"$(bucket)","imageInfo": $(imageInfo)}',
  };
  const putPolicy = new qiniu.rs.PutPolicy(options);
  const uploadToken = putPolicy.uploadToken(genMac());

  return uploadToken;
}

export interface QiniuUploadFileBody {
  hash?: string;
  key?: string;
  error?: string;
  fsize?: number;
  mimeType?: string;
  bucket?: string;
  imageInfo?: string;
}

/**
 * 上传文件
 * @param key oss中的key。 最好加前缀 如avatar/
 * @param filepath 文件名
 */
export function putFile(
  key: string,
  filepath: string
): Promise<QiniuUploadFileBody> {
  return new Promise<QiniuUploadFileBody>((resolve, reject) => {
    const putExtra = new qiniu.form_up.PutExtra();

    formUploader.putFile(
      genUploadToken(),
      key,
      filepath,
      putExtra,
      (err, body, info) => {
        if (err) {
          reject(err);
        } else {
          // console.log(body, info);
          resolve(body);
        }
      }
    );
  });
}

export interface QiniuFileStatBody {
  hash: string;
  md5: string;
  fsize: number;
  mimeType: string;
  putTime: number;
  type: number;
}

/**
 * 获取文件信息
 * @param key 文件key
 */
export function statFile(key: string): Promise<QiniuFileStatBody> {
  return new Promise((resolve, reject) => {
    bucketManager.stat(bucket, key, function(err, respBody, respInfo) {
      if (err) {
        reject(err);
      } else {
        if (respInfo.statusCode !== 200) {
          reject(respBody.error);
        } else {
          resolve(respBody);
        }
      }
    });
  });
}
