import images from 'images';
import _ from 'lodash';
import path from 'path';
import Debug from 'debug';
const debug = Debug('trpg:component:file:thumbnail');

/**
 * 生成缩略图的中间件，用于如果图片的大小超出范围则在同文件夹下生成相应的缩略图
 * 否则跳过
 * @param maxWidth 最大宽度
 * @param maxHeight 最大高度
 */
export default function thumbnail(maxWidth: number, maxHeight: number) {
  return async (ctx: any, next: any) => {
    const filePath = _.get(ctx, 'req.file.path');

    const image = images(filePath);
    const { width, height } = image.size();

    if (width > maxWidth || height > maxHeight) {
      // 生成缩略图
      const widthRadio = maxWidth / width;
      const heightRadio = maxHeight / height;

      const targetRadio = Math.min(widthRadio, heightRadio); // 为实现等比压缩。取较小值
      const targetWidth = width * targetRadio; // 目标大小的宽度
      const targetName = path.basename(filePath); // 处理文件名
      const targetDir = path.dirname(filePath); // 处理文件夹
      const targetPath = path.resolve(targetDir, 'thumbnail', targetName);

      debug('generate thumbnail with size:', targetWidth, height * targetRadio);
      image.resize(targetWidth).save(targetPath); // 修改大小并原地保存
      _.set(ctx, 'req.file.has_thumbnail', true);
      debug('generate completed!', targetPath);
    }

    return next();
  };
}
