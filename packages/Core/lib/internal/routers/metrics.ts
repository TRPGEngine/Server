import Router from 'koa-router';
const router = new Router();
import moment from 'moment';
import { CoreMetrics } from '../models/metrics';
import _ from 'lodash';

router.get('/metrics/all', async (ctx) => {
  const startDate = ctx.params.start
    ? moment(ctx.params.start)
    : moment().subtract(7, 'days');
  const endDate = ctx.params.end ? moment(ctx.params.end) : moment();

  const statis = await CoreMetrics.getStatisInfo(startDate, endDate);

  ctx.body = statis;
});

export default router;
