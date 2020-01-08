import { TRPGRouter } from 'trpg/core';
import { HelpFeedback } from '../models/feedback';

const faqRouter = new TRPGRouter();

faqRouter.get('/faq', (ctx, next) => {
  const template = require('../views/faq.marko');

  ctx.render(template);
});

faqRouter.get('/feedback', (ctx, next) => {
  const template = require('../views/feedback.marko');

  ctx.render(template);
});

faqRouter.get('/feedback/faq', (ctx, next) => {
  const faq = require('../../db/faq.js');

  ctx.body = {
    list: faq.list.map(([q, a]) => ({ q, a })),
  };
});

faqRouter.post('/feedback/submit', async (ctx, next) => {
  const data = ctx.request.body;
  const username = data['username'];
  const contact = data['contact'];
  const content = data['content'];

  if (!username) {
    ctx.body = {
      result: false,
      msg: '请填写用户名',
    };
    return;
  }

  if (!content) {
    ctx.body = {
      result: false,
      msg: '请填写内容',
    };
    return;
  }

  try {
    await HelpFeedback.create({
      username,
      contact,
      content,
    });

    ctx.body = {
      result: true,
    };
  } catch (err) {
    ctx.trpgapp.error(err); // 汇报错误
    ctx.body = {
      result: false,
      msg: '提交失败:' + err,
    };
  }
});

export default faqRouter;
