import { Orm, DBInstance, Model } from 'trpg/core';
import { ChatEmotionItem } from './item';

export class ChatEmotionCatalog extends Model {
  id!: number;
  uuid!: string;
  name: string;
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
