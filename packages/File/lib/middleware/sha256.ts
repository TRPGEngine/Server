/**
 * 将文件根据其文件路径生成相应的sha256并更名的中间件
 * 如果该文件已存在相同的sha256则视为该文件已存在
 *
 * 需要放在upload中间件后
 */
import Debug from 'debug';
const debug = Debug('trpg:component:file:sha256');
import fs from 'fs-extra';
import path from 'path';
import sha256File from 'sha256-file';
import _ from 'lodash';

export default function sha256() {
  return async (ctx: any, next: any) => {
    const { filename, path: filepath } = ctx.req.file;
    if (!filename || !filepath) {
      throw new Error('File Info Require!');
    }

    const ext = _.last((filename as string).split('.'));
    const hash: string = await sha256File(filepath);
    const newFilename = `${hash}.${ext}`;
    const newFilepath = path.resolve(path.dirname(filepath), newFilename); // 目标文件为同文件夹
    if (await fs.pathExists(newFilepath)) {
      // 文件已存在
      debug(
        `file [${newFilepath}] is exists! remove update file and return existsed file`
      );
      await fs.remove(filepath);
    } else {
      // 文件不存在
      await fs.move(filepath, newFilepath);
    }

    _.set(ctx, 'req.file.path', newFilepath);
    _.set(ctx, 'req.file.filename', newFilename);

    return next();
  };
}
