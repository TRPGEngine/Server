import moment from 'moment';
import { CoreMetrics } from '../models/metrics';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import { TRPGRouter } from 'trpg/core';
const router = new TRPGRouter();

// 获取统计信息的方法
const getStatisInfo = memoizeOne((startDate, endDate) => {
  return CoreMetrics.getStatisInfo(startDate, endDate);
});

router.get('/metrics/all', async (ctx) => {
  const startDate = ctx.params.start
    ? moment(ctx.params.start)
    : moment().subtract(7, 'days');
  const endDate = ctx.params.end ? moment(ctx.params.end) : moment();

  // 如果开始时间或结束时间不填，则会一直变。
  // 则不会应用缓存
  // 如果为固定值，则会应用缓存
  const statis = await getStatisInfo(startDate, endDate);

  ctx.body = statis;
});

export default router;
