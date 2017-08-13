let app = require('../../Core/')();
let player = require('../../Player/');
let chat = require('../../Chat/');
let room = require('../../Room/');

app.load(player);
app.load(chat);
app.load(room);

module.exports = app;
