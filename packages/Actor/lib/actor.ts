import Debug from 'debug';
const debug = Debug('trpg:component:actor');
import * as event from './event';
import ActorTemplateDefinition from './models/template';
import ActorDefinition from './models/actor';
import BasePackage from 'lib/package';
import actorRouter from './routers/actor';
import templateRouter from './routers/template';
import ActorTemplateDraftDefinition from './models/template_draft';

export default class Actor extends BasePackage {
  public name: string = 'Actor';
  public require: string[] = ['Player', 'File'];
  public desc: string = '角色卡与模板管理';

  onInit(): void {
    this.regModel(ActorDefinition);
    this.regModel(ActorTemplateDefinition);
    this.regModel(ActorTemplateDraftDefinition);

    this.app.actor = {};

    this.regSocketEvent('getTemplate', event.getTemplate);
    this.regSocketEvent('getSuggestTemplate', event.getSuggestTemplate);
    this.regSocketEvent('findTemplate', event.findTemplate);
    // 使用portal 通过http请求管理模板
    // this.regSocketEvent('createTemplate', event.createTemplate);
    // this.regSocketEvent('createTemplateAdvanced', event.createTemplate);
    // this.regSocketEvent('updateTemplate', event.updateTemplate);
    // this.regSocketEvent('removeTemplate', event.removeTemplate);
    this.regSocketEvent('createActor', event.createActor);
    this.regSocketEvent('getActor', event.getActor);
    this.regSocketEvent('removeActor', event.removeActor);
    this.regSocketEvent('updateActor', event.updateActor);
    this.regSocketEvent('shareActor', event.shareActor);
    this.regSocketEvent('unshareActor', event.unshareActor);
    this.regSocketEvent('forkActor', event.forkActor);

    this.regRoute(actorRouter);
    this.regRoute(templateRouter);

    this.app.registerSocketDataMask('actor::getTemplate', 'template.layout');
  }
}
