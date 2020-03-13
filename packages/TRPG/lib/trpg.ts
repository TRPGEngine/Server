import BasePackage from 'lib/package';
import TRPGReportDefinition from './models/game-report';

export default class TRPG extends BasePackage {
  public name: string = 'TRPG';
  public require: string[] = ['Player', 'Actor', 'Group', 'Chat'];
  public desc: string =
    'TRPG 专用包, 所有TRPG Engine独有内容都应当存放在这个包里';

  onInit(): void {
    // TODO
    // this.regModel(TRPGReportDefinition);
  }
}
