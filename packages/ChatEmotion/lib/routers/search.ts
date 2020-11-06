import _ from 'lodash';
import { TRPGRouter } from 'trpg/core';
import { SogouCrawler } from '../utils/crawler/sogou';

const searchRouter = new TRPGRouter();

const buildEmotionSearchCacheKey = (keyword: string) =>
  `chat-emotion:search:${keyword}`;

searchRouter.get('/search', async (ctx) => {
  const keyword = ctx.request.query.keyword;
  if (!keyword) {
    throw new Error('缺少必要字段');
  }

  const trpgapp = ctx.trpgapp;
  const cacheKey = buildEmotionSearchCacheKey(keyword);

  const cache = await trpgapp.cache.get(cacheKey);
  let emotions = [];
  if (_.isNil(cache)) {
    const crawler = new SogouCrawler(trpgapp);
    const html = await crawler.searchEmotion(keyword);
    emotions = crawler.parseEmotion(html);

    await trpgapp.cache.set(cacheKey, emotions);
  } else {
    emotions = cache as any;
  }

  ctx.body = { list: emotions };
});

export default searchRouter;
