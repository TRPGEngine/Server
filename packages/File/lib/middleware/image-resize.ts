import images from 'images';

/**
 * 图片大小限定的中间件，应放在upload中间件后
 * @param maxWidth 最大宽度
 * @param maxHeight 最大高度
 */
export default function imageResize(maxWidth: number, maxHeight: number) {
  return async (ctx: any, next: any) => {
    const { path } = ctx.req.file;

    const image = images(path);
    const { width, height } = image.size();

    if (width > maxWidth || height > maxHeight) {
      // 进行压缩
      const widthRadio = maxWidth / width;
      const heightRadio = maxHeight / height;

      const targetRadio = Math.min(widthRadio, heightRadio); // 为实现等比压缩。取较小值
      const targetWidth = width * targetRadio;

      image.resize(targetWidth).save(path); // 修改大小并原地保存
    }

    return next();
  };
}
