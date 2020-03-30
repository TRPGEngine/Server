import { buildAppContext } from 'test/utils/app';
import { InfoWebsite } from '../lib/models/Website';
import _ from 'lodash';

const context = buildAppContext();

describe('Info website', () => {
  it('getWebsiteInfo with og should be ok', async () => {
    const url = 'https://www.npmjs.com/package/react';
    const info = await InfoWebsite.getWebsiteInfo(url);

    expect(info).toHaveProperty('title');
    expect(info).toHaveProperty('content');
    expect(info).toHaveProperty('icon');
    expect(info.title).toBe('react');
    expect(info.content).toBe(
      'React is a JavaScript library for building user interfaces.'
    );
    expect(info.icon).toBe(
      'https://static.npmjs.com/338e4905a2684ca96e08c7780fc68412.png'
    );

    // 数据库里应当有数据
    expect(await InfoWebsite.findOne({ where: { url } })).not.toBeNull();
  }, 10000);

  it('getWebsiteInfo with other should be ok', async () => {
    const url = 'https://www.baidu.com';
    const info = await InfoWebsite.getWebsiteInfo(url);

    expect(info).toHaveProperty('title');
    expect(info).toHaveProperty('content');
    expect(info).toHaveProperty('icon');
    expect(info.title).toBe('百度一下，你就知道');
    expect(typeof info.content).toBe('string');
    expect(_.isEmpty(info.content)).toBe(false);
    expect(typeof info.icon).toBe('string');
    // 百度的页面老是换。也许需要找个其他的作为单元测试的case
    // expect(info.icon.startsWith('https://www.baidu.com/img/')).toBe(true);
    // expect(info.icon.endsWith('.png')).toBe(true);

    // 数据库里应当有数据
    expect(await InfoWebsite.findOne({ where: { url } })).not.toBeNull();
  }, 10000);
});
