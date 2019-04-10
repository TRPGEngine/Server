const app = require('../../Core/')();
const player = require('../../Player/');
const actor = require('../../Actor/');
const chat = require('../');

app.load(player);
app.load(actor);
app.load(chat);
app.run();
app.reset();
// app.close();
