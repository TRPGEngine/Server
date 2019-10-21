import BasePackage from 'lib/package';
import thirdPartyRouter from './routers/third-party';

// TODO: 将QQConnect 整合到这个包里
export default class OAuth extends BasePackage {
  public name: string = 'OAuth';
  public require: string[] = ['Player'];
  public desc: string = '基于OAuth2的授权处理包';

  onInit(): void {
    this.regRoute(thirdPartyRouter);
  }
}
