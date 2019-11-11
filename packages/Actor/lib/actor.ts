import Debug from 'debug';
const debug = Debug('trpg:component:actor');
import * as event from './event';
// import at from 'trpg-actor-template';
import ActorTemplateDefinition from './models/template';
import ActorDefinition from './models/actor';
import BasePackage from 'lib/package';

export default class Actor extends BasePackage {
  public name: string = 'Actor';
  public require: string[] = ['Player', 'File'];
  public desc: string = '角色与模板管理';

  onInit(): void {
    this.regModel(ActorDefinition);
    this.regModel(ActorTemplateDefinition);

    this.app.actor = {};

    this.regSocketEvent('getTemplate', event.getTemplate);
    this.regSocketEvent('getSuggestTemplate', event.getSuggestTemplate);
    this.regSocketEvent('findTemplate', event.findTemplate);
    this.regSocketEvent('createTemplate', event.createTemplate);
    this.regSocketEvent('createTemplateAdvanced', event.createTemplate);
    this.regSocketEvent('updateTemplate', event.updateTemplate);
    this.regSocketEvent('removeTemplate', event.removeTemplate);
    this.regSocketEvent('createActor', event.createActor);
    this.regSocketEvent('getActor', event.getActor);
    this.regSocketEvent('removeActor', event.removeActor);
    this.regSocketEvent('updateActor', event.updateActor);
  }
}

// function initReset() {
//   let app = this;

//   app.register('resetStorage', async function(storage, db) {
//     debug('start reset actor storage');

//     let template = at.getInitTemplate('刀剑神域模板');
//     template.desc = '这是一个测试用的模板';
//     template.insertCell(at.getInitCell('姓名').setValue('亚丝娜'));
//     template.insertCell(at.getInitCell('年龄').setValue(22));
//     template.insertCell(at.getInitCell('性别').setValue('女'));
//     template.insertCell(at.getInitCell('职业').setValue('刺剑使'));
//     template.insertCell(at.getInitCell('力量').setValue('10'));
//     template.insertCell(at.getInitCell('敏捷').setValue('15'));
//     template.insertCell(at.getInitCell('耐力').setValue('12'));
//     template.insertCell(at.getInitCell('智力').setValue('8'));
//     template.insertCell(at.getInitCell('魅力').setValue('11'));
//     template.insertCell(
//       at
//         .getInitCell('生命值')
//         .setFunc('expression')
//         .setDefault('({{力量}}*0.5 + {{耐力}}*2)*10')
//     );
//     template.insertCell(
//       at
//         .getInitCell('魔法值')
//         .setFunc('expression')
//         .setDefault('({{魅力}}*0.5 + {{智力}}*2)*10')
//     );
//     template.insertCell(
//       at
//         .getInitCell('物理攻击力')
//         .setFunc('expression')
//         .setDefault('{{力量}}*3 + {{敏捷}}*1')
//     );
//     template.insertCell(
//       at
//         .getInitCell('魔法攻击力')
//         .setFunc('expression')
//         .setDefault('{{智力}}*4')
//     );

//     try {
//       let _template = await db.models.actor_template.createAsync({
//         name: template.name,
//         desc: template.desc,
//         avatar: '',
//         info: at.stringify(template),
//         creatorId: 1,
//       });
//       template.eval();
//       let _actor = await db.models.actor_actor.createAsync({
//         name: '测试人物卡',
//         desc:
//           '测试人物卡描述测试人物卡描述测试人物卡描述测试人物卡描述测试人物卡描述',
//         avatar:
//           'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=2290997136,1993186762&fm=27&gp=0.jpg',
//         template_uuid: _template.uuid,
//         info: template.getData(),
//         ownerId: 1,
//       });
//     } catch (err) {
//       throw new Error(err);
//     }
//   });
// }
