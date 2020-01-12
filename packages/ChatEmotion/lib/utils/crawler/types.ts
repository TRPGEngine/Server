export interface CrawlerEmotionItem {
  name?: string;
  url: string;
}

export interface Crawler {
  name: string;
  searchEmotion(keyword: string): Promise<string>;
  parseEmotion(rawHtml: string): CrawlerEmotionItem[];
}
