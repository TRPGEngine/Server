const player = require('../packages/Player');
const actor = require('../packages/Actor');
const chat = require('../packages/Chat');
const chatEmotion = require('../packages/ChatEmotion');
const dice = require('../packages/Dice');
const group = require('../packages/Group');
const file = require('../packages/File');
const dashboard = require('../packages/Dashboard');
const note = require('../packages/Note');
const help = require('../packages/Help');
const qqconnect = require('../packages/QQConnect');
const report = require('../packages/Report');
const mail = require('../packages/Mail');
const notify = require('../packages/Notify');

module.exports = function loadModules(app) {
  app.load(player);
  app.load(file());
  app.load(actor);
  app.load(chat);
  app.load(chatEmotion);
  app.load(dice); // 尚未测试
  app.load(group);
  app.load(dashboard); // 尚未测试
  app.load(note); // 尚未测试
  app.load(help);
  app.load(qqconnect); // 尚未测试
  app.load(report); // 尚未测试
  app.load(mail); // 尚未测试
  app.load(notify);

  return app;
};
