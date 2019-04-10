const debug = require('debug')('trpg:component:note');
const Router = require('koa-router');
const event = require('./event');

module.exports = function NoteComponent(app) {
  initStorage.call(app);
  initSocket.call(app);
  initRouters.call(app);

  return {
    name: 'NoteComponent',
    require: [
      'PlayerComponent',
    ],
  }
}

function initStorage() {
  let app = this;
  let storage = app.storage;
  storage.registerModel(require('./models/note.js'));

  app.on('initCompleted', function(app) {
    // 数据信息统计
    debug('storage has been load 1 note db model');
  });
}

function initSocket() {
  let app = this;
  app.registerEvent('note::get', event.get);
  app.registerEvent('note::save', event.save);
}

function initRouters() {
  const app = this;
  const webservice = app.webservice;
  const router = new Router();

  const note = require('./routers/note');

  router.use('/note', note.routes());
  webservice.use(router.routes());
}
