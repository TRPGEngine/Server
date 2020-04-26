import { TRPGRouter } from 'trpg/core';
import { TRPGRecruit } from '../models/recruit';

const recruitRouter = new TRPGRouter();

recruitRouter.get('/recruit/feed', async (ctx) => {
  const feed = await TRPGRecruit.getTRPGRecruitFeed();

  ctx.body = feed;
  ctx.type = 'application/rss+xml';
});

export default recruitRouter;
