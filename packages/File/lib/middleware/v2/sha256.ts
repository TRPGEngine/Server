import { TRPGMiddleware } from 'trpg/core';
import { UploadFileState } from './upload';
import _ from 'lodash';
import { sha265File } from '../../utils/sha265';
import path from 'path';

/**
 * 该中间件依赖于upload中间件
 * 根据文件buffer计算sha256的值修改文件名
 */
export function sha256(): TRPGMiddleware<UploadFileState> {
  return (ctx, next) => {
    const file = ctx.state.file;
    if (_.isNil(file)) {
      throw new Error('生成摘要值失败: 文件不存在');
    }

    const ext = path.extname(file.filename); // .png
    const filehash = sha265File(file.buffer);
    file.filename = filehash + ext;

    return next();
  };
}
