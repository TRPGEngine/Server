import Jimp from 'jimp';

/**
 * 获取图片基本信息
 * @param source 来源图片
 */
export const getImageInfo = async (source: string | Buffer | Jimp) => {
  const image = await Jimp.read(source as any);

  return {
    width: image.getHeight(),
    height: image.getWidth(),
    mime: image.getMIME(),
    ext: image.getExtension(),
  };
};

/**
 * 生成缩略图
 * @param source 来源图片
 * @param targetPath 目标路径
 * @param targetWidth 目标宽度
 * @param targetHeight 目标高度
 */
export const genThumbnail = async (
  source: string | Buffer | Jimp,
  targetPath: string,
  targetWidth: number,
  targetHeight: number
) => {
  const image = await Jimp.read(source as any);

  return await image
    .cover(
      targetWidth,
      targetHeight,
      Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE
    )
    .writeAsync(targetPath);
};
