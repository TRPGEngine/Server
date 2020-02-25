import _ from 'lodash';
import path from 'path';
import Debug from 'debug';
import { TRPGMiddleware } from 'trpg/core';
import { genThumbnail, compressImageBuffer } from '../../utils/jimp';
import { UploadFileState } from './upload';
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
): TRPGMiddleware<UploadFileState> {
  return async (ctx, next) => {
    const file = ctx.state.file;
    if (_.isNil(file)) {
      throw new Error('生成缩略图失败: 文件不存在');
    }

    const { buffer, size } = await compressImageBuffer(
      file.buffer,
      maxWidth,
      maxHeight
    );

    file.buffer = buffer;
    file.size = size;

    return next();
  };
}
