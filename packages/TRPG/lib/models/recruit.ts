import { Model, Orm, DBInstance } from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';
import { Feed } from 'feed';
import _ from 'lodash';
import moment from 'moment';

export class TRPGRecruit extends Model {
  uuid: string;
  title: string;
  content: string;
  author: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;

  static FEED_CACHE_KEY = 'trpg:recruit:feed';
  static expireCacheFrequency = 30 * 60 * 1000; // 30分钟

  /**
   * 获取招募的Feed
   * 缓存优先
   */
  static async getTRPGRecruitFeed(): Promise<string> {
    const trpgapp = TRPGRecruit.getApplication();
    const data = await trpgapp.cache.get(TRPGRecruit.FEED_CACHE_KEY);

    if (!_.isNil(data)) {
      // 如果缓存中有数据则直接读缓存数据
      return String(data);
    }

    const recruits: TRPGRecruit[] = await TRPGRecruit.findAll({
      where: {
        completed: false,
      },
      order: [['updatedAt', 'DESC']],
    });

    const feed = new Feed({
      id: trpgapp.get('apihost'),
      title: 'TRPG Engine Recruit',
      copyright: 'TRPG Engine',
    });
    recruits.forEach((r) => {
      feed.addItem({
        title: r.title,
        link: '', // TODO
        content: r.content,
        contributor: [{ name: r.author }],
        date: r.updatedAt,
      });
    });

    const ret = feed.rss2();
    await trpgapp.cache.set(TRPGRecruit.FEED_CACHE_KEY, ret, {
      expires: TRPGRecruit.expireCacheFrequency,
    });

    return ret;
  }

  /**
   * 创建一条招募信息
   * 每天只能发布一条招募信息
   */
  static async createTRPGRecruit(
    playerUUID: string,
    title: string,
    content: string
  ): Promise<TRPGRecruit> {
    const player = await PlayerUser.findByUUID(playerUUID);
    if (_.isNil(player)) {
      throw new Error('用户不存在');
    }

    // 获取上一条招募信息
    const prevRecruit = await TRPGRecruit.findOne({
      order: [['updatedAt', 'DESC']],
    });
    if (
      !_.isNil(prevRecruit) &&
      moment().diff(moment(prevRecruit.createdAt), 'days', true) < 1
    ) {
      // 上一条招募请求在一天内
      throw new Error('不能在1天内发布多条招募信息');
    }

    const recruit = await TRPGRecruit.create({
      title,
      author: player.getName(),
      content,
      completed: false,
      ownerId: player.id,
    });

    // 清空缓存
    const trpgapp = TRPGRecruit.getApplication();
    await trpgapp.cache.remove(TRPGRecruit.FEED_CACHE_KEY);

    return recruit;
  }
}

export default function TRPGRecruitDefinition(Sequelize: Orm, db: DBInstance) {
  TRPGRecruit.init(
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      title: { type: Sequelize.STRING, allowNull: false },
      author: { type: Sequelize.STRING, allowNull: false },
      content: { type: Sequelize.TEXT, allowNull: false },
      completed: { type: Sequelize.BOOLEAN, defaultValue: false },
    },
    {
      tableName: 'trpg_recruit',
      sequelize: db,
    }
  );

  TRPGRecruit.belongsTo(PlayerUser, { as: 'owner', foreignKey: 'ownerId' });

  return TRPGRecruit;
}
