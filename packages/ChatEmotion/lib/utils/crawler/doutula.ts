import { Crawler, CrawlerEmotionItem } from './types';
import { TRPGApplication } from 'trpg/core';
import cheerio from 'cheerio';
import _ from 'lodash';

// http://www.doutula.com/
export class DoutulaCrawler implements Crawler {
  name = 'doutula';

  constructor(private app: TRPGApplication) {}

  async searchEmotion(keyword: string): Promise<string> {
    const html = await this.app.request.get(
      `http://www.doutula.com/search`,
      {
        keyword,
      },
      {
        headers: {
          referer: 'http://www.doutula.com',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
        },
      }
    );

    return html;
  }

  parseEmotion(rawHtml: string): CrawlerEmotionItem[] {
    const $ = cheerio.load(rawHtml);
    const images = $('.search-result a');

    return images
      .map((index, ele) => {
        const el = $(ele);
        return {
          name: el.find('p').text(),
          url: el.find('img').attr('data-original'),
        };
      })
      .get()
      .filter((item) => !_.isEmpty(item.url));
  }
}
