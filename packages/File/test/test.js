const app = require('../../Core/')();
const file = require('../');

app.load(file());
app.run();
// app.close();
