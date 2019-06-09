import { Orm, DBInstance, Model } from 'trpg/core';

export class ChatEmotionCatalog extends Model {
  id!: number;
}

export default function ChatEmotionCatalogModel(
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
      as: 'catalogs',
    });
  }

  return ChatEmotionCatalog;
}
