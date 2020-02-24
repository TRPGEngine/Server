import { TRPGMiddleware } from 'trpg/core';
import { UploadFileState } from './upload';
import _ from 'lodash';
import { FileOSS } from '../../models/oss';
import { FileType } from '../../types';
import os from 'os';
import path from 'path';
import fs from 'fs-extra';

/**
 * 存储中间件
 * 该中间件应当放于upload中间件后
 */

interface StorageFileState extends UploadFileState {
  ossInfo: FileOSS;
}

export function storage(fileType: FileType): TRPGMiddleware<StorageFileState> {
  return async (ctx, next) => {
    const file = ctx.state.file;
    if (_.isNil(file)) {
      throw new Error('存储失败: 文件不存在');
    }

    const trpgapp = ctx.trpgapp;
    const storage = trpgapp.get('file.storage');

    if (storage === 'local') {
      // TODO: 存储到本地
      throw new Error('TODO: 无法存储文件到本地');
    } else {
      // 存储到oss
      // 先写入到本地临时文件
      const tmpPath = path.resolve(os.tmpdir(), file.filename);
      await fs.writeFile(tmpPath, file.buffer);

      const ossInfo = await FileOSS.upload(fileType, tmpPath);
      ctx.state.ossInfo = ossInfo;

      await next();
    }
  };
}
