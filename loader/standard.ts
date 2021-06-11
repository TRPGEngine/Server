import type { TRPGApplication } from 'trpg/core';
import Player from '../packages/Player';
import File from '../packages/File';
import Actor from '../packages/Actor';
import Chat from '../packages/Chat';
import ChatEmotion from '../packages/ChatEmotion';
import Dice from '../packages/Dice';
import Group from '../packages/Group';
import Note from '../packages/Note';
import Help from '../packages/Help';
// import QQConnect from '../packages/QQConnect';
import Report from '../packages/Report';
import Mail from '../packages/Mail';
// import Notify from '../packages/Notify';
import Deploy from '../packages/Deploy';
import Info from '../packages/Info';
import OAuth from '../packages/OAuth';
import TRPG from '../packages/TRPG';
import Bot from '../packages/Bot';
// import Dashboard from '../packages/Dashboard';

// TODO: 等待转换成新的包
const dashboard = require('../packages/Dashboard');
const qqconnect = require('../packages/QQConnect');
const notify = require('../packages/Notify');

// TODO: 使用dependency-helper的方法进行排序
module.exports = function loadModules(app: TRPGApplication) {
  app.load(Player);
  app.load(File);
  app.load(Chat);
  app.load(ChatEmotion);
  app.load(Dice);
  app.load(Group);
  app.load(Actor);
  app.load(Note);
  app.load(Help);
  app.load(qqconnect); // 尚未测试
  app.load(Report);
  app.load(Mail);
  app.load(notify);
  app.load(Deploy);
  app.load(Info);
  app.load(OAuth);
  app.load(TRPG);
  app.load(Bot);

  app.load(dashboard); // 尚未测试

  return app;
};
