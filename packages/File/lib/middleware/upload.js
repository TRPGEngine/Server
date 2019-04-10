const multer = require('koa-multer');//加载koa-multer模块
const config = require('../config');

module.exports = (isPersistence = false) => multer({
  storage: multer.diskStorage({
    //文件保存路径
    destination: function (req, file, cb) {
      if(isPersistence) {
        cb(null, 'public/uploads/persistence/')
      }else {
        cb(null, 'public/uploads/temporary/')
      }
    },
    //修改文件名称
    filename: function (req, file, cb) {
      let fileFormat = (file.originalname).split(".");
      cb(null, Date.now() + "." + fileFormat[fileFormat.length - 1]);
    },
  }),
  limits: config.limits,
});
