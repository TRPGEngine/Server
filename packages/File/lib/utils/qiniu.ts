import qiniu from 'qiniu';
import config from 'config';
import _ from 'lodash';

const accessKey = _.get(config, 'file.oss.qiniu.accessKey', '');
const secretKey = _.get(config, 'file.oss.qiniu.secretKey', '');
const bucket = _.get(config, 'file.oss.qiniu.bucket', '');

const qiniuConfig = new qiniu.conf.Config({
  zone: qiniu.zone.Zone_z0,
});
const formUploader = new qiniu.form_up.FormUploader(qiniuConfig);

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
  };
  const putPolicy = new qiniu.rs.PutPolicy(options);
  const uploadToken = putPolicy.uploadToken(genMac());

  return uploadToken;
}

export interface QiniuUploadFileBody {
  hash?: string;
  key?: string;
  error?: string;
}

/**
 * 上传文件
 * @param key oss中的key。 最好加前缀
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
