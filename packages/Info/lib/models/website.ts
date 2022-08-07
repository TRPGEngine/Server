import { Model, DBInstance, Orm } from 'trpg/core';
import _ from 'lodash';
import cheerio from 'cheerio';
import urlParser from 'url';
import { isUrl } from '../utils';

interface WebsiteInfo {
  title: string;
  content: string;
  icon: string;
}

export class InfoWebsite extends Model {
  url: string;
  title: string;
  content: string;
  icon: string;

  /**
   * 创建网址的网站信息
   * @param url 地址
   * @param title 标题
   * @param content 概述内容
   * @param icon 图标
   */
  static async createWebsiteInfo(
    url: string,
    title: string,
    content: string,
    icon: string
  ): Promise<void> {
    await InfoWebsite.create({
      url,
      title,
      content,
      icon,
    }).catch((e) => {}); // 出错不抛出异常因为没有意义
  }

  /**
   * 移除某个网址的网站信息
   * @param url 网址
   */
  static async removeWebsiteInfo(url: string): Promise<void> {
    await InfoWebsite.destroy({
      where: { url },
    });
  }

  /**
   * 获取网站标准信息
   * 以og标准为优先
   * @param url 网址
   */
  static async getWebsiteInfo(url: string): Promise<WebsiteInfo> {
    // 尝试从数据库获取数据
    const info: InfoWebsite = await InfoWebsite.findOne({
      where: {
        url,
      },
    });
    if (info) {
      const { title, content, icon } = info;
      return {
        title,
        content,
        icon,
      };
    }

    const app = InfoWebsite.getApplication();
    try {
      if (!isUrl(url)) {
        throw new Error('不是一个合法的Url');
      }

      const body = await app.request.get(encodeURI(url));
      const $ = cheerio.load(body);

      const title =
        $('meta[property="og:title"]').attr('content') ||
        $('title').first().text();

      const content =
        $('meta[property="og:description"]').attr('content') ||
        $('body').text().substr(0, 150).replace(/\s/g, '');

      let icon =
        $('meta[property="og:image"]').attr('content') ||
        $('img[src]:not([src$=".gif"])').first().attr('src');
      if (_.isString(icon)) {
        icon = urlParser.resolve(url, icon);
      }

      await InfoWebsite.createWebsiteInfo(url, title, content, icon);

      return {
        title,
        content,
        icon,
      };
    } catch (err) {
      await InfoWebsite.createWebsiteInfo(url, '', '', '');

      return {
        title: '',
        content: '',
        icon: '',
      };
    }
  }
}

export default function InfoWebsiteDefinition(Sequelize: Orm, db: DBInstance) {
  InfoWebsite.init(
    {
      url: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isUrl: true,
        },
      },
      title: {
        type: Sequelize.STRING,
      },
      content: {
        type: Sequelize.STRING,
      },
      icon: {
        type: Sequelize.STRING,
      },
    },
    {
      tableName: 'info_website',
      sequelize: db,
    }
  );

  return InfoWebsite;
}
