import { genThumbnail } from '../utils/jimp';

/**
 * 图片大小限定的中间件，应放在upload中间件后
 * @param maxWidth 最大宽度
 * @param maxHeight 最大高度
 */
export default function imageResize(maxWidth: number, maxHeight: number) {
  return async (ctx: any, next: any) => {
    const { path } = ctx.req.file;

    await genThumbnail(path, path, maxWidth, maxHeight);

    return next();
  };
}
