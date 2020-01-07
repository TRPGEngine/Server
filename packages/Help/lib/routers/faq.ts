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

  ctx.body = faq.list.map(([q, a]) => ({ q, a }));
});

faqRouter.post('/feedback/submit', async (ctx, next) => {
  let data = ctx.request.body;
  let username = data['username'];
  let contact = data['contact-link'];
  let content = data['feedback-content'];

  if (!username) {
    ctx.body = '请填写用户名';
    return;
  }

  if (!content) {
    ctx.body = '请填写内容';
    return;
  }

  try {
    await HelpFeedback.create({
      username,
      contact,
      content,
    });

    ctx.body = '提交成功';
  } catch (err) {
    ctx.trpgapp.error(err); // 汇报错误
    ctx.body = '提交失败';
  }
});

export default faqRouter;
