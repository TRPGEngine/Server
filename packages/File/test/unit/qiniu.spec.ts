import path from 'path';
process.env.NODE_CONFIG_DIR = path.resolve(__dirname, '../../../../config/');
import config from 'config';
import _ from 'lodash';
import { genUploadToken, putFile } from 'packages/File/lib/utils/qiniu';

describe('qiniu oss unit test', () => {
  it('config could get', () => {
    const accessKey = _.get(config, 'file.oss.qiniu.accessKey', '');
    const secretKey = _.get(config, 'file.oss.qiniu.secretKey', '');
    const bucket = _.get(config, 'file.oss.qiniu.bucket', '');

    expect(accessKey).not.toBe('');
    expect(secretKey).not.toBe('');
    expect(bucket).not.toBe('');
  });

  it('should generate token', () => {
    const token = genUploadToken();
    expect(typeof token).toBe('string');
    expect(token.split(':')).toHaveLength(3);
  });

  it('could upload file to oss', async () => {
    const body = await putFile(
      'test/demo.txt',
      path.resolve(__dirname, '../example/example.txt')
    );

    if (body.error && body.error === 'file exists') {
      // 如果上传返回文件已存在则跳出
      return Promise.resolve();
    }

    expect(body).toHaveProperty('hash');
    expect(body).toHaveProperty('key');
  });
});
