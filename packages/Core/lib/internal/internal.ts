import BasePackage from 'lib/package';
import CoreSystemLogDefinition from './models/system-log';
import CoreGlobalConfigDefinition from './models/global-config';
import CoreMetricsDefinition, { CoreMetrics } from './models/metrics';
import { ApolloServer, gql } from 'apollo-server-koa';
import Debug from 'debug';
const debug = Debug('trpg:component:internal');

import CoreRouter from './routers/core';
import { generateSchema } from './graphql/generate-schema';

const SOCKET_PREFIX = 'metrics:socket:event:';
const WEBSERVICE_PREFIX = 'metrics:webservice:route:';

export default class Core extends BasePackage {
  public name: string = 'Core';
  public require: string[] = [];
  public desc: string = '内核包';
  onInit(): void {
    this.regModel(CoreSystemLogDefinition);
    this.regModel(CoreGlobalConfigDefinition);
    this.regModel(CoreMetricsDefinition);

    this.regRoute(CoreRouter);
    if (this.getConfig('graphql.enable') === true) {
      this.app.on('initCompleted', () => {
        // 全部加载完毕后初始化GraphQL服务。 保证所有的数据库模型都加载完毕
        this.initGraphQL();
      });
    }

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

          // 计算平均值与最大最小值
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

        // 处理 webservice route 事件统计
        const webserviceKeys = metricsRecordKeys.filter((key) =>
          key.startsWith(WEBSERVICE_PREFIX)
        );
        const webserviceRecord = [];
        for (const key of webserviceKeys) {
          const vals = await this.app.cache.lget(key);
          this.app.cache.lclear(key, 0, vals.length);
          const arr = vals.map((v) => Number(v) || 0);

          // 计算平均值与最大最小值
          const avg = arr.reduce((prev, cur) => prev + cur, 0);
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

  initGraphQL() {
    const db = this.app.storage.db;
    const schema = generateSchema(db);

    // TODO: 需要一个鉴权机制
    const graphql = new ApolloServer({
      schema,
    });
    graphql.applyMiddleware({
      app: this.app.webservice.app,
      path: '/core/graphql',
    });
    debug('GraphQL Service Start!');
  }
}
