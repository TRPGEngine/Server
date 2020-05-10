import BasePackage from 'lib/package';
import CoreSystemLogDefinition from './models/system-log';
import CoreGlobalConfigDefinition from './models/global-config';
import CoreMetricsDefinition, { CoreMetrics } from './models/metrics';
import CoreSchedulejobHistoryDefinition from './models/schedulejob-record';
import Debug from 'debug';
const debug = Debug('trpg:component:internal');

import CoreRouter from './routers/core';
import MetricsRouter from './routers/metrics';
import GraphQLRouter from './routers/graphql';
import { getGlobalConfig } from './event';

const SOCKET_PREFIX = 'metrics:socket:event:';
const WEBSERVICE_PREFIX = 'metrics:webservice:route:';

function calcAvg(nums: number[]) {
  const sum = nums.reduce((prev, cur) => prev + cur, 0);
  const count = nums.length;
  return Number((sum / count).toFixed(2));
}

export default class Core extends BasePackage {
  public name: string = 'Core';
  public require: string[] = [];
  public desc: string = '内核包';
  onInit(): void {
    this.regModel(CoreSystemLogDefinition);
    this.regModel(CoreGlobalConfigDefinition);
    this.regModel(CoreMetricsDefinition);
    this.regModel(CoreSchedulejobHistoryDefinition);

    this.regRoute(CoreRouter);
    this.regRoute(MetricsRouter);
    this.regRoute(GraphQLRouter);

    this.regSocketEvent('getGlobalConfig', getGlobalConfig);

    // 每小时执行一次收集事件调用时间
    this.regScheduleJob(
      'collect-metrics',
      '0 0 */1 * * *',
      async (fireDate) => {
        const date = fireDate;
        debug('collect-metrics ...');

        const metricsRecordKeys = await this.app.cache.keys('metrics:*');

        // 处理 socket 事件统计
        const socketKeys = metricsRecordKeys.filter((key) =>
          key.startsWith(SOCKET_PREFIX)
        );
        const socketRecord = [];
        for (const key of socketKeys) {
          const vals = await this.app.cache.lget(key);
          this.app.cache.lclear(key, 0, vals.length);
          const arr = vals.map((v) => Number(v) || 0);

          if (arr.length === 0) {
            // 如果没有数据。则跳出循环
            continue;
          }

          // 计算平均值与最大最小值
          const avg = calcAvg(arr);
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

        // 处理 webservice route 事件统计
        const webserviceKeys = metricsRecordKeys.filter((key) =>
          key.startsWith(WEBSERVICE_PREFIX)
        );
        const webserviceRecord = [];
        for (const key of webserviceKeys) {
          const vals = await this.app.cache.lget(key);
          this.app.cache.lclear(key, 0, vals.length);
          const arr = vals.map((v) => Number(v) || 0);

          if (arr.length === 0) {
            // 如果没有数据。则跳出循环
            continue;
          }

          // 计算平均值与最大最小值
          const avg = calcAvg(arr);
          const max = Math.max(...arr);
          const min = Math.min(...arr);
          const count = arr.length;

          webserviceRecord.push({
            name: key.substr(WEBSERVICE_PREFIX.length),
            date,
            type: 'route',
            avg_usage: avg,
            min_usage: min,
            max_usage: max,
            count,
          });
        }
        await CoreMetrics.bulkCreate(webserviceRecord);
      }
    );
  }
}
