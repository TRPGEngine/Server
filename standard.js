const config = require('config');
const loadModules = require('./loader/standard');

const app = require('./packages/Core/')(config);

loadModules(app);

app.run();
// app.reset();

module.exports = app;
