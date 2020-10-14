import _ from 'lodash';
import { TRPGMiddleware } from 'trpg/core';
import { compressImageBuffer } from '../../utils/jimp';
import { UploadFileState } from './upload';

export interface ImageThumbnailState extends UploadFileState {
  imageInfo: {
    width: number;
    height: number;
  };
}

/**
 * 生成缩略图的中间件，用于如果图片的大小超出范围则在同文件夹下生成相应的缩略图
 * 否则跳过
 * 该中间件应当在Upload中间件之后
 * @param maxWidth 最大宽度
 * @param maxHeight 最大高度
 */
export function thumbnail(
  maxWidth: number,
  maxHeight: number
): TRPGMiddleware<ImageThumbnailState> {
  return async (ctx, next) => {
    const file = ctx.state.file;
    if (_.isNil(file)) {
      throw new Error('生成缩略图失败: 文件不存在');
    }

    const { buffer, size, image } = await compressImageBuffer(
      file.buffer,
      maxWidth,
      maxHeight
    );

    file.buffer = buffer;
    file.size = size;

    ctx.state.imageInfo = {
      width: image.getWidth(),
      height: image.getHeight(),
    };

    return next();
  };
}
