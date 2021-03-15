import { TRPGRouter } from 'trpg/core';
import { ReportError } from '../models/error';
import _ from 'lodash';
import moment from 'moment';

const reportRouter = new TRPGRouter();

reportRouter.post('/error', async (ctx) => {
  const ip = ctx.request.headers['x-real-ip'] || ctx.request.ip;
  const ua = ctx.request.headers['user-agent'];
  const { message = '', stack = '', version } = ctx.request.body;

  console.log('report err from', ip, 'stack', stack);
  await ReportError.create({
    ip,
    ua,
    message,
    stack: stack.trim(),
    version,
  });

  ctx.body = '提交成功';
});

/**
 * 获取日统计信息
 */
reportRouter.get('/statis/daily', async (ctx) => {
  const date = ctx.query.date;

  if (_.isNil(date)) {
    throw new Error('缺少必要字段');
  }

  const dateStr = moment(date).format('YYYY-MM-DD');

  const db = ctx.trpgapp.storage.db;
  const [chatlog, login, register] = await Promise.all([
    db.models.report_chatlog_daily
      .findOne({
        where: {
          start: dateStr,
        },
      })
      .then((d) => d?.count ?? -1),
    db.models.report_login_times_daily
      .findOne({
        where: {
          start: dateStr,
        },
      })
      .then((d) => d?.user_count ?? -1),
    db.models.report_register_daily
      .findOne({
        where: {
          start: dateStr,
        },
      })
      .then((d) => d?.count ?? -1),
  ]);

  ctx.body = {
    count: {
      chatlog,
      login,
      register,
    },
  };
});

export default reportRouter;
