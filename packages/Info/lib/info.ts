import BasePackage from 'lib/package';
import InfoWebsiteDefinition from './models/website';
import WebsiteRouter from './routers/website';

export default class Info extends BasePackage {
  public name: string = 'Info';
  public require: string[] = [];
  public desc: string = '网站信息获取与短链接生成跳转';

  onInit(): void {
    this.regModel(InfoWebsiteDefinition);

    this.regRoute(WebsiteRouter);
  }
}
