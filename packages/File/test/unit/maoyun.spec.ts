import {
  sign,
  uploadFileWithBuffer,
  getUploadToken,
} from 'packages/File/lib/utils/maoyun';
import fs from 'fs-extra';
import path from 'path';

/**
 * 猫云的文档不好用。先不写了放在这里
 * http://doc.maoyuncloud.com/#/bucket
 */

describe.skip('maoyun', () => {
  test('sign', () => {
    const signature = sign('GET', {
      Action: 'GetDomainsFlow',
      AppId: '201000000000009751761923411',
      Format: 'JSON',
      SignatureNonce: '9b7a44b0-3be1-11e5-8c73-08002700c460',
      TimeStamp: '2019-11-25T02:19:46Z',
      Domain: 'test.maoyuxxxncloud.com',
    });

    expect(typeof signature).toBe('string');
  });

  test('getUploadToken', async () => {
    const uploadToken = await getUploadToken('test/example-image.png');
    console.log('uploadToken', uploadToken);
  });

  test('upload', async () => {
    const file = fs.readFileSync(
      path.resolve(__dirname, '../example/example-image.png')
    );

    const ret = await uploadFileWithBuffer('test/example-image.png', file);

    console.log('ret', ret);
  });
});
