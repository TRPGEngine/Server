import BasePackage from 'lib/package';
import OAuthAppDefinition from './models/app';
import oauthRouter from './routers/oauth';
import thirdPartyRouter from './routers/third-party';

// TODO: 将QQConnect 整合到这个包里
export default class OAuth extends BasePackage {
  public name: string = 'OAuth';
  public require: string[] = ['Player'];
  public desc: string = '基于OAuth2的授权处理包';

  onInit(): void {
    this.regModel(OAuthAppDefinition);

    this.regRoute(thirdPartyRouter);
    this.regRoute(oauthRouter);
  }
}
