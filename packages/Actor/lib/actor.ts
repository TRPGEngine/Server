import Debug from 'debug';
const debug = Debug('trpg:component:actor');
import * as event from './event';
import ActorTemplateDefinition from './models/template';
import ActorDefinition from './models/actor';
import BasePackage from 'lib/package';
import actorRouter from './routers/actor';
import templateRouter from './routers/template';
import GroupActorDefinition from './models/group-actor';

export default class Actor extends BasePackage {
  public name: string = 'Actor';
  public require: string[] = ['Player', 'File', 'Group'];
  public desc: string = '个人人物卡, 团人物卡与模板管理';

  onInit(): void {
    this.regModel(ActorDefinition);
    this.regModel(ActorTemplateDefinition);
    this.regModel(GroupActorDefinition);

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
    this.regSocketEvent('getGroupActorInitData', event.getGroupActorInitData);
    this.regSocketEvent('group::getGroupActors', event.getGroupActors);
    this.regSocketEvent(
      'group::getGroupActorMapping',
      event.getGroupActorMapping
    );
    this.regSocketEvent('group::addGroupActor', event.addGroupActor);
    this.regSocketEvent('group::removeGroupActor', event.removeGroupActor);
    this.regSocketEvent('group::agreeGroupActor', event.agreeGroupActor);
    this.regSocketEvent('group::refuseGroupActor', event.refuseGroupActor);
    this.regSocketEvent(
      'group::updateGroupActorInfo',
      event.updateGroupActorInfo
    );
    this.regSocketEvent(
      'group::setPlayerSelectedGroupActor',
      event.setPlayerSelectedGroupActor
    );
    this.regSocketEvent(
      'group::getPlayerSelectedGroupActor',
      event.getPlayerSelectedGroupActor
    );

    this.regRoute(actorRouter);
    this.regRoute(templateRouter);
    this.router.use('/group', actorRouter.routes()); // 从group包中迁移过来的

    this.app.registerSocketDataMask('actor::getTemplate', 'template.layout');
  }
}
