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
 * 从图片中间等比例压缩后裁切出一块指定宽高的图片
 * @param source 来源图片
 * @param targetPath 目标路径
 * @param targetWidth 目标宽度
 * @param targetHeight 目标高度
 * @param onlyNecessary 是否仅当需要时生成: 如果目标图片的宽高高于原图，则不生成缩略图
 */
export const genThumbnail = async (
  source: string | Buffer | Jimp,
  targetPath: string,
  targetWidth: number,
  targetHeight: number,
  onlyNecessary: boolean = false
) => {
  const image = await Jimp.read(source as any);

  if (
    onlyNecessary &&
    targetWidth >= image.getWidth() &&
    targetHeight >= image.getHeight()
  ) {
    // 仅当目标宽高均大于等于原图宽高时。跳过生成代码
    return { image, isThumbnail: false };
  }

  const newImage = await image
    .cover(
      targetWidth,
      targetHeight,
      Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE
    )
    .writeAsync(targetPath);

  return { image: newImage, isThumbnail: true };
};
