import fs from 'fs-extra';
import path from 'path';
import _ from 'lodash';

/**
 * 移动文件夹的中间件
 * @param targetDir 目标文件夹
 */
export default function move(targetDir: string) {
  return async (ctx: any, next: any) => {
    const { path: filepath } = ctx.req.file;

    await fs.ensureDir(targetDir);
    const target = path.resolve(targetDir, path.basename(filepath));
    await fs.move(filepath, target);

    _.set(ctx, 'req.file.path', target);

    return next();
  };
}
