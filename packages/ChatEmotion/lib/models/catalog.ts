import {
  Orm,
  DBInstance,
  Model,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyRemoveAssociationMixin,
} from 'trpg/core';
import { ChatEmotionItem } from './item';
import { PlayerUser } from 'packages/Player/lib/models/user';
import _ from 'lodash';

declare module 'packages/Player/lib/models/user' {
  interface PlayerUser {
    getEmotionCatalogs?: BelongsToManyGetAssociationsMixin<ChatEmotionCatalog>;
    addEmotionCatalog?: BelongsToManyAddAssociationMixin<
      ChatEmotionCatalog,
      number
    >;
    removeEmotionCatalog?: BelongsToManyRemoveAssociationMixin<
      ChatEmotionCatalog,
      number
    >;
  }
}

/**
 * 生成用户的缓存key
 * @param uuid 用户UUID
 */
export const getUserEmotionCatalogCacheKey = (userUUID: string): string =>
  `chatemotion:user:${userUUID}:catalog`;

export class ChatEmotionCatalog extends Model {
  id!: number;
  uuid!: string;
  name: string;

  /**
   * 获取指定用户所拥有的所有的表情包的集合以及该集合下的表情图片
   * TODO: 因为数据量有点大，因此需要性能优化一下(压缩字段, 缓存请求)
   * @param userUUID 用户的UUID
   */
  static async getUserEmotionCatalogByUUID(
    userUUID: string
  ): Promise<ChatEmotionCatalog[]> {
    // 尝试获取表情包缓存
    const cacheKey = getUserEmotionCatalogCacheKey(userUUID);
    const app = ChatEmotionCatalog.getApplication();
    const cacheList = await app.cache.get(cacheKey);

    if (_.isArray(cacheList)) {
      // 应用缓存
      return cacheList.map(
        (val) =>
          new ChatEmotionCatalog(val, {
            isNewRecord: false,
            include: [
              {
                model: ChatEmotionItem,
                as: 'items',
              },
            ],
          })
      );
    } else {
      const user = await PlayerUser.findByUUID(userUUID);
      const catalogs: ChatEmotionCatalog[] = await user.getEmotionCatalogs({
        include: [
          {
            model: ChatEmotionItem,
            as: 'items',
          },
        ],
      });

      await app.cache.set(cacheKey, catalogs); // 设置缓存

      return catalogs;
    }
  }

  /**
   * 增加用户表情包
   * @param userUUID 用户UUID
   * @param catalog 表情包
   */
  static async addUserEmotionCatalog(
    userUUID: string,
    catalog: ChatEmotionCatalog
  ) {
    const user = await PlayerUser.findByUUID(userUUID);
    await user.addEmotionCatalog(catalog);

    // 清理表情包缓存
    const app = ChatEmotionCatalog.getApplication();
    await app.cache.remove(getUserEmotionCatalogCacheKey(user.uuid));
  }
}

export default function ChatEmotionCatalogDefinition(
  Sequelize: Orm,
  db: DBInstance
) {
  ChatEmotionCatalog.init(
    {
      uuid: {
        type: Sequelize.UUID,
        required: true,
        defaultValue: Sequelize.UUIDV1,
      },
      name: {
        type: Sequelize.STRING,
        required: true,
      },
    },
    { tableName: 'chat_emotion_catalog', sequelize: db }
  );

  ChatEmotionItem.belongsTo(ChatEmotionCatalog, {
    foreignKey: 'catalogId',
    as: 'catalog',
  });
  ChatEmotionCatalog.hasMany(ChatEmotionItem, {
    foreignKey: 'catalogId',
    as: 'items',
  });

  const User = db.models.player_user as any;
  if (!!User) {
    ChatEmotionCatalog.belongsTo(User, { as: 'owner' });

    // Usermap
    ChatEmotionCatalog.belongsToMany(User, {
      through: 'chat_emotion_usermap_catalog',
      as: 'users',
    });
    User.belongsToMany(ChatEmotionCatalog, {
      through: 'chat_emotion_usermap_catalog',
      as: 'emotionCatalogs',
    });
  }

  return ChatEmotionCatalog;
}
