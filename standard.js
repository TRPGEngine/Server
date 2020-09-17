require('ts-node').register();
require('tsconfig-paths').register();

const config = require('config');
const loadModules = require('./loader/standard');

const app = require('./packages/Core/')(config);

loadModules(app);

app.run();

module.exports = app;
