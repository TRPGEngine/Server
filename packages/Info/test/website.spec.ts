import { InfoWebsite as InfoWebsiteCls } from '../lib/models/Website';

describe('Info website', () => {
  const InfoWebsite: typeof InfoWebsiteCls = global.db.models.info_website;

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
    const url = 'https://baidu.com';
    const info = await InfoWebsite.getWebsiteInfo(url);

    expect(info).toHaveProperty('title');
    expect(info).toHaveProperty('content');
    expect(info).toHaveProperty('icon');
    expect(info.title).toBe('百度一下，你就知道');
    expect(info.content).toBe(
      '输入法手写拼音关闭百度首页设置登录新闻hao123地图视频贴吧学术登录设置更多产品网页资讯贴吧知道音乐图片视频地图文库更多»'
    );
    expect(info.icon).toBe('https://www.baidu.com/img/baidu_resultlogo@2.png');

    // 数据库里应当有数据
    expect(await InfoWebsite.findOne({ where: { url } })).not.toBeNull();
  }, 10000);
});
