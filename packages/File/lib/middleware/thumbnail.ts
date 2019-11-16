import _ from 'lodash';
import path from 'path';
import Debug from 'debug';
import { TRPGMiddleware } from 'trpg/core';
import { genThumbnail } from '../utils/jimp';
const debug = Debug('trpg:component:file:thumbnail');

/**
 * 生成缩略图的中间件，用于如果图片的大小超出范围则在同文件夹下生成相应的缩略图
 * 否则跳过
 * @param maxWidth 最大宽度
 * @param maxHeight 最大高度
 */
export default function thumbnail(
  maxWidth: number,
  maxHeight: number
): TRPGMiddleware {
  return async (ctx, next) => {
    const filePath = _.get(ctx, 'req.file.path');
    if (!_.isString(filePath)) {
      throw new Error('生成缩略图失败: 文件不存在 ' + filePath);
    }

    const targetName = path.basename(filePath); // 处理文件名
    const targetDir = path.dirname(filePath); // 处理文件夹
    const targetPath = path.resolve(targetDir, 'thumbnail', targetName);

    const { isThumbnail } = await genThumbnail(
      filePath,
      targetPath,
      maxWidth,
      maxHeight,
      true
    );
    if (isThumbnail) {
      // 如果成功生成了缩略图
      _.set(ctx, 'req.file.has_thumbnail', true);
      debug('generate completed!', targetPath);
    }

    return next();
  };
}
