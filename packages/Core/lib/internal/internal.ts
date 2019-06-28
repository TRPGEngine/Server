import BasePackage from 'lib/package';
import CoreSystemLogDefinition from './models/system-log';
import CoreGlobalConfigDefinition from './models/global-config';
import CoreMetricsDefinition, { CoreMetrics } from './models/metrics';
import Debug from 'debug';
const debug = Debug('trpg:component:internal');

const SOCKET_PREFIX = 'metrics:socket:event:';

export default class Core extends BasePackage {
  public name: string = 'Core';
  public require: string[] = [];
  public desc: string = '内核包';
  onInit(): void {
    this.regModel(CoreSystemLogDefinition);
    this.regModel(CoreGlobalConfigDefinition);
    this.regModel(CoreMetricsDefinition);

    this.regScheduleJob(
      'collect-metrics',
      '0 0 */1 * * *',
      async (fireDate) => {
        const date = fireDate;
        debug('collect-metrics ...');

        const metricsRecordKeys = await this.app.cache.keys('metrics:*');

        // 处理socket 事件统计
        const socketKeys = metricsRecordKeys.filter((key) =>
          key.startsWith(SOCKET_PREFIX)
        );
        const socketRecord = [];
        for (const key of socketKeys) {
          const vals = await this.app.cache.lget(key);
          this.app.cache.lclear(key, 0, vals.length);
          const arr = vals.map((v) => Number(v) || 0);

          // 计算
          const avg = arr.reduce((prev, cur) => prev + cur, 0);
          const max = Math.max(...arr);
          const min = Math.min(...arr);
          const count = arr.length;

          socketRecord.push({
            name: key.substr(SOCKET_PREFIX.length),
            date,
            type: 'socket',
            avg_usage: avg,
            min_usage: min,
            max_usage: max,
            count,
          });
        }
        await CoreMetrics.bulkCreate(socketRecord);
      }
    );
  }
}
