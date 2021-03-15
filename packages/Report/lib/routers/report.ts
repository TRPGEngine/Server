import { TRPGRouter } from 'trpg/core';
import { ReportError } from '../models/error';
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

export default reportRouter;
