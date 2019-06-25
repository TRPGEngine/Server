import BasePackage from 'lib/package';
import CoreMetricsDefinition from './models/metrics';

export default class Core extends BasePackage {
  public name: string = 'Core';
  public require: string[] = [];
  public desc: string = '内核包';
  onInit(): void {
    this.regModel(CoreMetricsDefinition);
  }
}
