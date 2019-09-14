import BasePackage from 'lib/package';
import DeployVersionDefinition from './models/version';
import versionRouter from './routers/version';

export default class Deploy extends BasePackage {
  public name: string = 'deploy';
  public require: string[] = ['player', 'chat'];
  public desc: string = '管理发布信息';

  onInit(): void {
    this.regModel(DeployVersionDefinition);

    this.regRoute(versionRouter);
  }
}
