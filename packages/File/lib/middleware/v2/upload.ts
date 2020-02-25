import multer = require('koa-multer');
import { TRPGMiddleware } from 'trpg/core';
import config from '../../config';
import { compose } from 'packages/Core/lib/utils/middleware';
import _ from 'lodash';

export interface UploadFileState {
  file: multer.File;
}

/**
 * 这个中间件只接受单个文件的上传
 * 文件处理只放在内存中
 */
export function upload(fieldName: string): TRPGMiddleware<UploadFileState> {
  const ins = multer({
    storage: multer.memoryStorage(),
    limits: config.limits,
  });

  const middleware1 = ins.single(fieldName);
  const middleware2: TRPGMiddleware<UploadFileState> = async (ctx, next) => {
    const file: multer.File = _.get(ctx, 'req.file');

    const ext = _.last(file.originalname.split('.'));
    const filename = `${Date.now()}.${ext}`;
    file.filename = filename; // 给一个默认文件名

    ctx.state.file = file;
    await next();
  };

  return compose([middleware1, middleware2]);
}
