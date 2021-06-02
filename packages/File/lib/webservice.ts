import documentRouter from './routers/document';
import { TRPGApplication, TRPGRouter } from 'trpg/core';
import avatarV2Router from './routers/v2/avatar';
import imageV2Router from './routers/v2/image';

export function initFileService(app: TRPGApplication) {
  const webservice = app.webservice;
  const router = new TRPGRouter();

  //#region 以下路由已经弃用, 请不要使用
  const file = require('./routers/file');
  const avatar = require('./routers/avatar');
  const chatimg = require('./routers/chatimg');
  router.use('/file', file.routes());
  router.use('/file/avatar', avatar.routes());
  router.use('/file/chatimg', chatimg.routes());
  router.use('/file', documentRouter.routes());
  //#endregion

  router.use('/file/v2/avatar', avatarV2Router.routes());
  router.use('/file/v2/image', imageV2Router.routes());

  webservice.use(router.routes());
}
