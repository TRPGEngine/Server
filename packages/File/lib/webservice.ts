import Router from 'koa-router';
import documentRouter from './routers/document';

export function initFileService(app) {
  const webservice = app.webservice;
  const router = new Router();

  const file = require('./routers/file');
  const avatar = require('./routers/avatar');
  const chatimg = require('./routers/chatimg');
  router.use('/file', file.routes());
  router.use('/file/avatar', avatar.routes());
  router.use('/file/chatimg', chatimg.routes());
  router.use('/file', documentRouter.routes());
  webservice.use(router.routes());
}
