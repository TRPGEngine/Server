import BasePackage from 'lib/package';
import fs from 'fs-extra';
import ChatEmotionItemModel from './models/item';
import ChatEmotionCatalogModel from './models/catalog';
import EmotionRouter from './routers/emotion';
import UsermapRouter from './routers/usermap';
import { emotionsDir } from './constant';
import { getUserEmotionCatalog } from './event';
import ChatEmotionSecretSignalModel from './models/secretSignal';

export default class ChatEmotion extends BasePackage {
  public name: string = 'ChatEmotion';
  public require: string[] = [
    'PlayerComponent',
    'FileComponent',
    'ChatComponent',
  ];
  public desc: string = '表情包服务';

  onInit(): void {
    this.ensureDir();

    this.regModel(ChatEmotionItemModel);
    this.regModel(ChatEmotionCatalogModel);
    this.regModel(ChatEmotionSecretSignalModel);

    // 注册路由组件
    this.regRoute(EmotionRouter);
    this.regRoute(UsermapRouter);

    // 注册socket事件
    this.regSocketEvent('getUserEmotionCatalog', getUserEmotionCatalog);
  }

  /**
   * 确保表情包文件夹存在
   */
  ensureDir(): Promise<void> {
    return fs.ensureDir(emotionsDir);
  }
}
