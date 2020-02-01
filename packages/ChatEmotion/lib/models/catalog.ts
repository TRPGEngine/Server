import {
  Orm,
  DBInstance,
  Model,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyAddAssociationMixin,
} from 'trpg/core';
import { ChatEmotionItem } from './item';
import { PlayerUser } from 'packages/Player/lib/models/user';

declare module 'packages/Player/lib/models/user' {
  interface PlayerUser {
    getEmotionCatalogs?: BelongsToManyGetAssociationsMixin<ChatEmotionCatalog>;
    addEmotionCatalog?: BelongsToManyAddAssociationMixin<
      ChatEmotionCatalog,
      number
    >;
  }
}

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
    const user = await PlayerUser.findByUUID(userUUID);
    const catalogs: ChatEmotionCatalog[] = await user.getEmotionCatalogs({
      include: [
        {
          model: ChatEmotionItem,
          as: 'items',
        },
      ],
    });

    return catalogs;
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
