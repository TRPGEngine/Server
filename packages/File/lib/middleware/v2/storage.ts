import { TRPGMiddleware } from 'trpg/core';
import { UploadFileState } from './upload';
import _ from 'lodash';
import { FileOSS } from '../../models/oss';
import { FileType, StorageType } from '../../types';
import os from 'os';
import path from 'path';
import url from 'url';
import fs from 'fs-extra';

export interface StorageFileState extends UploadFileState {
  isLocal: boolean;
  url: string; // 返回斜线开头的相对路径(trpgapi地址)或完整路径(oss路径)
}

/**
 * 存储中间件
 * 该中间件应当放于upload中间件后
 */
export function storage(fileType: FileType): TRPGMiddleware<StorageFileState> {
  return async (ctx, next) => {
    const file = ctx.state.file;
    if (_.isNil(file)) {
      throw new Error('存储失败: 文件不存在');
    }

    const trpgapp = ctx.trpgapp;
    const storage: StorageType = trpgapp.get('file.storage');

    if (storage === 'local') {
      // 存储到本地
      let dir = `./public/${fileType}`;
      await fs.writeFile(path.resolve(dir, file.filename), file.buffer);
      const apihost = trpgapp.get('apihost');
      ctx.state.isLocal = true;
      ctx.state.url = url.resolve(apihost, `/${fileType}/${file.filename}`);
    } else {
      // 存储到oss
      // 先写入到本地临时文件
      const tmpPath = path.resolve(os.tmpdir(), file.filename);
      await fs.writeFile(tmpPath, file.buffer);

      const ossInfo = await FileOSS.upload(fileType, tmpPath);
      ctx.state.isLocal = false;
      ctx.state.url = ossInfo.getUrl();
    }

    return next();
  };
}
