import multer from 'koa-multer'; //加载koa-multer模块
import config from '../config';
import _ from 'lodash';

/**
 * @deprecated
 * 上传文件中间件
 * @param path 文件上传路径，可以为boolean型， 如果为true则上传到永久目录，如果为false则上传到临时目录， 默认为false
 */
function uploadMiddleware(path: string | boolean = false) {
  return multer({
    storage: multer.diskStorage({
      //文件保存路径
      destination: function(req, file, cb) {
        if (typeof path === 'boolean') {
          path = path
            ? 'public/uploads/persistence/'
            : 'public/uploads/temporary/';
        }

        cb(null, path);
      },
      //修改文件名称
      filename: function(req, file, cb) {
        const ext = _.last(file.originalname.split('.'));
        const filename = `${Date.now()}.${ext}`;
        cb(null, filename);
      },
    }),
    limits: config.limits,
  });
}

export default uploadMiddleware;
module.exports = uploadMiddleware;
