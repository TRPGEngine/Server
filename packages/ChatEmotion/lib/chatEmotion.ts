import BasePackage from 'lib/package';
import fs from 'fs-extra';
import ChatEmotionCatalogModel from './models/catalog';
import ChatEmotionItemModel from './models/item';

export default class ChatEmotion extends BasePackage {
  public name: string = 'ChatEmotionComponent';
  public require: string[] = [
    'PlayerComponent',
    'FileComponent',
    'ChatComponent',
  ];
  public desc: string = '表情包服务';

  onInit(): void {
    this.ensureDir();

    this.regModel(ChatEmotionCatalogModel);
    this.regModel(ChatEmotionItemModel);

    // TODO: 注册路由组件
  }

  /**
   * 确保表情包文件夹存在
   */
  ensureDir(): Promise<void> {
    return fs.ensureDir('public/uploads/persistence/emotions');
  }
}
