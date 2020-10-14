import multer from 'koa-multer';
import _ from 'lodash';
import { TRPGMiddleware } from 'trpg/core';
import { getImageInfo } from '../../utils/jimp';

export interface ImageInfoState {
  imageInfo: {
    width: number;
    height: number;
    mime: string;
    ext: string;
  };
}

/**
 * 获取图片信息中间件
 */
export function imageInfo(): TRPGMiddleware<ImageInfoState> {
  return async (ctx, next) => {
    const file: multer.File = ctx.state.file;
    if (_.isNil(file)) {
      throw new Error('获取图片信息失败: 文件不存在');
    }

    const info = await getImageInfo(file.buffer);

    ctx.state.imageInfo = info;

    return next();
  };
}
