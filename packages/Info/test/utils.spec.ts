import { isUrl } from '../lib/utils';

describe('isUrl', () => {
  test.each([
    ['http://baidu.com', true],
    ['https://baidu.com', true],
    ['//baidu.com', true],
    ['ws://baidu.com', true],
    ['www.baidu.com', true],
    ['m.baidu.com', false],
    ['baidu.com', false],
    ['baidu', false],
  ])('%s => %s', (url: string, output: boolean) => {
    expect(isUrl(url)).toBe(output);
  });
});
