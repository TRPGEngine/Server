import path from 'path';
process.env.NODE_CONFIG_DIR = path.resolve(__dirname, '../../../../config/');
import config from 'config';
import _ from 'lodash';
import {
  genUploadToken,
  putFile,
  statFile,
} from 'packages/File/lib/utils/qiniu';

describe('qiniu oss unit test', () => {
  if (process.env.NODE_ENV === 'ci') {
    // ci 环境不测试qiniu相关API
    return;
  }

  const demoKey = 'test/demo.txt';
  const demoImageKey = 'test/demo-image.png';

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

  it(
    'could upload txt file to oss',
    async () => {
      const body = await putFile(
        demoKey,
        path.resolve(__dirname, '../example/example.txt')
      );

      if (body.error && body.error === 'file exists') {
        // 如果上传返回文件已存在则跳出
        return Promise.resolve();
      }

      expect(body).toHaveProperty('hash');
      expect(body).toHaveProperty('key');
      expect(body).toHaveProperty('fsize');
      expect(body).toHaveProperty('mimeType');
      expect(body).toHaveProperty('bucket');
      expect(body).toHaveProperty('imageInfo');

      expect(body).toMatchObject({
        key: demoKey,
        fsize: 11,
        mimeType: 'text/plain',
        imageInfo: null,
      });
    },
    20 * 1000
  );

  it(
    'could upload image file to oss',
    async () => {
      const body = await putFile(
        demoImageKey,
        path.resolve(__dirname, '../example/example-image.png')
      );

      if (body.error && body.error === 'file exists') {
        // 如果上传返回文件已存在则跳出
        return Promise.resolve();
      }

      expect(body).toHaveProperty('hash');
      expect(body).toHaveProperty('key');
      expect(body).toHaveProperty('fsize');
      expect(body).toHaveProperty('mimeType');
      expect(body).toHaveProperty('bucket');
      expect(body).toHaveProperty('imageInfo');

      expect(body).toMatchObject({
        key: demoImageKey,
        fsize: 18377,
        mimeType: 'image/png',
        imageInfo: {
          colorModel: 'nrgba',
          format: 'png',
          height: 144,
          size: 18377,
          width: 144,
        },
      });
    },
    20 * 1000
  );

  it('could get file info', async () => {
    const info = await statFile(demoKey);

    expect(info).toHaveProperty('fsize');
    expect(info).toHaveProperty('hash');
    expect(info).toHaveProperty('md5');
    expect(info).toHaveProperty('mimeType');
    expect(info).toHaveProperty('putTime');
    expect(info).toHaveProperty('type');
  });
});
