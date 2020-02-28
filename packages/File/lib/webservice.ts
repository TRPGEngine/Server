import documentRouter from './routers/document';
import { TRPGRouter } from 'trpg/core';
import avatarV2Router from './routers/v2/avatar';

export function initFileService(app) {
  const webservice = app.webservice;
  const router = new TRPGRouter();

  const file = require('./routers/file');
  const avatar = require('./routers/avatar');
  const chatimg = require('./routers/chatimg');
  router.use('/file', file.routes());
  router.use('/file/avatar', avatar.routes());
  router.use('/file/chatimg', chatimg.routes());
  router.use('/file', documentRouter.routes());

  router.use('/file/v2/avatar', avatarV2Router.routes());

  webservice.use(router.routes());
}
