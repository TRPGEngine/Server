import BasePackage from 'lib/package';
import InfoWebsiteDefinition from './models/Website';

export default class Info extends BasePackage {
  public name: string = 'info';
  public require: string[] = [];
  public desc: string = '网站信息获取与短链接生成跳转';

  onInit(): void {
    this.regModel(InfoWebsiteDefinition);
  }
}
