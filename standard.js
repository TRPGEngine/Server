require('ts-node').register();
require('tsconfig-paths').register();

const loadModules = require('./loader/standard');

const app = require('./packages/Core/')();

loadModules(app);

app.run();

module.exports = app;
