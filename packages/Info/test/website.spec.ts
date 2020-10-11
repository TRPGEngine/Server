import { buildAppContext } from 'test/utils/app';
import { InfoWebsite } from '../lib/models/website';
import _ from 'lodash';

const context = buildAppContext();

describe('InfoWebsite', () => {
  test('removeWebsiteInfo should be ok', async () => {
    const url = 'http://testurl.com/';
    const info = await InfoWebsite.create({ url });

    try {
      const tmp = await InfoWebsite.findOne({ where: { url } });
      expect(tmp).toBeTruthy();
      expect(tmp.id).toBe(info.id);

      await InfoWebsite.removeWebsiteInfo(url);
      expect(await InfoWebsite.findOne({ where: { url } })).toBeNull();
    } finally {
      await InfoWebsite.destroy({
        where: { url },
      });
    }
  });

  test('getWebsiteInfo with og should be ok', async () => {
    const url = 'https://www.npmjs.com/package/react';
    await InfoWebsite.removeWebsiteInfo(url);
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

  test('getWebsiteInfo with other should be ok', async () => {
    const url = 'https://www.baidu.com';
    await InfoWebsite.removeWebsiteInfo(url);
    const info = await InfoWebsite.getWebsiteInfo(url);

    expect(info).toHaveProperty('title');
    expect(info).toHaveProperty('content');
    expect(info).toHaveProperty('icon');
    // expect(info.title).toBe('百度一下，你就知道');
    expect(typeof info.content).toBe('string');
    expect(_.isEmpty(info.content)).toBe(false);
    // expect(typeof info.icon).toBe('string');
    // 百度的页面老是换。也许需要找个其他的作为单元测试的case
    // expect(info.icon.startsWith('https://www.baidu.com/img/')).toBe(true);
    // expect(info.icon.endsWith('.png')).toBe(true);

    // 数据库里应当有数据
    expect(await InfoWebsite.findOne({ where: { url } })).not.toBeNull();
  }, 10000);

  test('getWebsiteInfo with plain text', async () => {
    const url = 'https://api.github.com/repos/konvajs/konva/pulls/994';
    await InfoWebsite.removeWebsiteInfo(url);
    const info = await InfoWebsite.getWebsiteInfo(url);

    expect(info).toHaveProperty('title', '');
    expect(info).toHaveProperty('content', '');
    expect(info).toHaveProperty('icon', '');

    expect(await InfoWebsite.findOne({ where: { url } })).not.toBeNull();
  });
});
