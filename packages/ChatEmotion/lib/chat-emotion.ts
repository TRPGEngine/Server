import BasePackage from 'lib/package';
import fs from 'fs-extra';
import ChatEmotionItemDefinition from './models/item';
import ChatEmotionCatalogDefinition from './models/catalog';
import ChatEmotionSecretSignalDefinition from './models/secret-signal';
import emotionRouter from './routers/emotion';
import usermapRouter from './routers/usermap';
import searchRouter from './routers/search';
import { emotionsDir } from './constant';
import { getUserEmotionCatalog, addUserEmotionWithSecretSignal } from './event';

export default class ChatEmotion extends BasePackage {
  public name: string = 'ChatEmotion';
  public require: string[] = ['Player', 'File', 'Chat'];
  public desc: string = '表情包服务';

  onInit(): void {
    this.ensureDir();

    this.regModel(ChatEmotionItemDefinition);
    this.regModel(ChatEmotionCatalogDefinition);
    this.regModel(ChatEmotionSecretSignalDefinition);

    // 注册路由组件
    this.regRoute(emotionRouter);
    this.regRoute(usermapRouter);
    this.regRoute(searchRouter);

    // 注册socket事件
    this.regSocketEvent('getUserEmotionCatalog', getUserEmotionCatalog);
    this.regSocketEvent(
      'addUserEmotionWithSecretSignal',
      addUserEmotionWithSecretSignal
    );
  }

  /**
   * 确保表情包文件夹存在
   */
  ensureDir(): Promise<void> {
    return fs.ensureDir(emotionsDir);
  }
}
