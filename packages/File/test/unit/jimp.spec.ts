import path from 'path';
import fs from 'fs-extra';
import { genThumbnail, getImageInfo } from 'packages/File/lib/utils/jimp';

const targetDir = path.resolve(__dirname, '../dist/');
const targetFile = (filename: string) => path.resolve(targetDir, filename);
const logoImage = path.resolve(__dirname, '../example/example-image.png');
const bigImage = path.resolve(__dirname, '../example/example-big-image.jpg');

beforeAll(() => {
  fs.removeSync(targetDir);
});

describe('jimp functions', () => {
  test('getImageInfo shoule be ok', async () => {
    const info = await getImageInfo(logoImage);

    expect(info).toMatchObject({
      width: 144,
      height: 144,
      mime: 'image/png',
      ext: 'png',
    });
  });

  test('genThumbnail should be ok', async () => {
    const targetPath = targetFile('genThumbnail.jpg');

    await genThumbnail(bigImage, targetPath, 144, 144);

    expect(await getImageInfo(targetPath)).toMatchObject({
      width: 144,
      height: 144,
    });
  });

  test('genThumbnail if onlyNecessary === false(default) should be ok', async () => {
    const targetPath = targetFile('genThumbnail-large.jpg');

    const thumbnail = await genThumbnail(logoImage, targetPath, 256, 256);

    expect(await getImageInfo(targetPath)).toMatchObject({
      width: 256,
      height: 256,
    });
    expect(thumbnail.isThumbnail).toBe(true);
  });

  test('genThumbnail if onlyNecessary === true should be ok', async () => {
    const targetPath = targetFile('genThumbnail-onlyNecessary.jpg');

    const thumbnail = await genThumbnail(logoImage, targetPath, 256, 256, true);

    expect(await fs.pathExists(targetPath)).toBe(false); // 因为目标大小大于原图所以没有生成对应文件
    expect(thumbnail.isThumbnail).toBe(false);
  });
});
