const http = require('http');
const Koa = require('koa');
const logger = require('koa-logger');
const koaBody = require('koa-body');
const serve = require('koa-static');
const Router = require('koa-router');
const cors = require('koa-cors');
const fs = require('fs');
const enableDestroy = require('server-destroy');
const debug = require('debug')('trpg:component:file:koa');
//文件上传
// core is CoreComponent
module.exports = function (core, port) {
  let app = new Koa();
  let router = new Router();

  app.use(logger());
  app.use(serve('public'));
  app.use(cors());
  app.use(koaBody());
  app.use(async (ctx, next) => {
    ctx.trpgapp = core;
    await next();
  });

  const avatar = require('./routers/avatar');
  router.use('/file/avatar', avatar.routes());
  app.use(router.routes());
  app.use(router.allowedMethods());

  let server = http.createServer(app.callback());
  enableDestroy(server);
  server.listen(port);
  debug('file component listening on port %d', port);

  return server;
}
