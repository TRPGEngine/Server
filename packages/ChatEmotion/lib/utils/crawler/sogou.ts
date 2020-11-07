import { TRPGApplication } from 'trpg/core';
import { Crawler, CrawlerEmotionItem } from './types';

export class SogouCrawler implements Crawler {
  name: string;

  constructor(private app: TRPGApplication) {}

  async searchEmotion(keyword: string): Promise<string> {
    const html = await this.app.request.get(
      `https://pic.sogou.com/pics/json.jsp?query=${encodeURIComponent(
        `${keyword} 表情`
      )}&st=5&start=0&xml_len=60&callback=callback&reqFrom=wap_result&`,
      {},
      {
        headers: {
          accept: '*/*',
          'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7',
          'cache-control': 'no-cache',
          pragma: 'no-cache',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'same-origin',
          referrer: `https://pic.sogou.com/pic/emo/searchList.jsp?statref=search_form&uID=hTHHybkSPt37C46z&spver=0&rcer=&keyword=${encodeURIComponent(
            keyword
          )}`,
          referrerPolicy: 'no-referrer-when-downgrade',
          'user-agent':
            'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
        },
      }
    );

    return html;
  }

  parseEmotion(rawHtml: string): CrawlerEmotionItem[] {
    try {
      const parseDataResult = rawHtml.match(/callback\((.+)\)/);
      const data = JSON.parse(`${parseDataResult[1]}`);

      type Image = {
        locImageLink: string;
        width: number;
        height: number;
      };
      const images = data.items as Image[];
      return images.map(({ locImageLink }) => ({
        url: locImageLink,
      }));
    } catch (err) {
      this.app.error(err);
    }

    return [];
  }
}
