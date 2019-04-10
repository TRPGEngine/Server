const EventEmitter = require('events').EventEmitter;
const mixin = require('merge-descriptors');
const proto = require('./application');
const globals = require('./globals');
const debug = require('debug')('trpg:core');

require('./utils'); // 引入工具拓展

exports = module.exports = createApplication;

function createApplication(conf) {
  let app = {};

  mixin(app, EventEmitter.prototype, false);
  mixin(app, globals, false);
  mixin(app, proto, false);

  setConfig(app, conf);

  // app.init();
  return app;
}

function setConfig(app, conf) {
  if(!conf) {
    return;
  }

  for (let key in conf) {
    app.set(key, conf[key]);
  }
}
