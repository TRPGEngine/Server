import { buildAppContext } from 'test/utils/app';
import { DoutulaCrawler } from '../lib/utils/crawler/doutula';
import { SogouCrawler } from '../lib/utils/crawler/sogou';

const context = buildAppContext();

describe('crawler', () => {
  test.skip('doutula', async () => {
    const doutula = new DoutulaCrawler(context.app);
    const html = await doutula.searchEmotion('滑稽');
    const emotions = doutula.parseEmotion(html);

    expect(Array.isArray(emotions)).toBe(true);
    expect(emotions.length).toBeGreaterThan(0);
    expect(emotions[0]).toHaveProperty('name');
    expect(emotions[0]).toHaveProperty('url');
  });

  test.skip('sogou', async () => {
    const doutula = new SogouCrawler(context.app);
    const html = await doutula.searchEmotion('滑稽');
    const emotions = doutula.parseEmotion(html);

    expect(Array.isArray(emotions)).toBe(true);
    expect(emotions.length).toBeGreaterThan(0);
    expect(emotions[0]).toHaveProperty('url');
  });
});
