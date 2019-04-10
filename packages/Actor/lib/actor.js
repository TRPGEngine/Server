const debug = require('debug')('trpg:component:actor');
const event = require('./event');
const at = require('trpg-actor-template');
const uuid = require('uuid/v1');

module.exports = function ActorComponent(app) {
  initStorage.call(app);
  initFunction.call(app);
  initSocket.call(app);
  initReset.call(app);

  return {
    name: 'ActorComponent',
    require: ['PlayerComponent', 'FileComponent'],
  }
}

function initStorage() {
  let app = this;
  let storage = app.storage;
  storage.registerModel(require('./models/actor.js'));
  storage.registerModel(require('./models/template.js'));

  app.on('initCompleted', function(app) {
    // 数据信息统计
    debug('storage has been load 2 actor db model');
  });
}

function initFunction() {
  let app = this;
  app.actor = {};
}

function initSocket() {
  let app = this;
  app.registerEvent('actor::getTemplate', event.getTemplate);
  app.registerEvent('actor::findTemplate', event.findTemplate);
  app.registerEvent('actor::createTemplate', event.createTemplate);
  app.registerEvent('actor::createTemplateAdvanced', event.createTemplate);
  app.registerEvent('actor::updateTemplate', event.updateTemplate);
  app.registerEvent('actor::removeTemplate', event.removeTemplate);
  app.registerEvent('actor::createActor', event.createActor);
  app.registerEvent('actor::getActor', event.getActor);
  app.registerEvent('actor::removeActor', event.removeActor);
  app.registerEvent('actor::updateActor', event.updateActor);
}

function initReset() {
  let app = this;

  app.register('resetStorage', async function(storage, db) {
    debug('start reset actor storage');

    let template = at.getInitTemplate('刀剑神域模板');
    template.desc = '这是一个测试用的模板';
    template.insertCell(at.getInitCell('姓名').setValue('亚丝娜'));
    template.insertCell(at.getInitCell('年龄').setValue(22));
    template.insertCell(at.getInitCell('性别').setValue('女'));
    template.insertCell(at.getInitCell('职业').setValue('刺剑使'));
    template.insertCell(at.getInitCell('力量').setValue('10'));
    template.insertCell(at.getInitCell('敏捷').setValue('15'));
    template.insertCell(at.getInitCell('耐力').setValue('12'));
    template.insertCell(at.getInitCell('智力').setValue('8'));
    template.insertCell(at.getInitCell('魅力').setValue('11'));
    template.insertCell(at.getInitCell('生命值').setFunc('expression').setDefault('({{力量}}*0.5 + {{耐力}}*2)*10'));
    template.insertCell(at.getInitCell('魔法值').setFunc('expression').setDefault('({{魅力}}*0.5 + {{智力}}*2)*10'));
    template.insertCell(at.getInitCell('物理攻击力').setFunc('expression').setDefault('{{力量}}*3 + {{敏捷}}*1'));
    template.insertCell(at.getInitCell('魔法攻击力').setFunc('expression').setDefault('{{智力}}*4'));

    try {
      let _template = await db.models.actor_template.createAsync({
        name: template.name,
        desc: template.desc,
        avatar: '',
        info: at.stringify(template),
        creatorId: 1,
      });
      template.eval();
      let _actor = await db.models.actor_actor.createAsync({
        name: '测试人物卡',
        desc: '测试人物卡描述测试人物卡描述测试人物卡描述测试人物卡描述测试人物卡描述',
        avatar: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=2290997136,1993186762&fm=27&gp=0.jpg',
        template_uuid: _template.uuid,
        info: template.getData(),
        ownerId: 1,
      });
    }catch(err) {
      throw new Error(err);
    }
  })
}
