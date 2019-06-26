import Hashids from 'hashids';
import { Model, DBInstance, Orm } from 'trpg/core';
import { ChatEmotionCatalog } from './catalog';
import _ from 'lodash';

const hashids = new Hashids('trpgemotion', 6, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');

export class ChatEmotionSecretSignal extends Model {
  public static async getUniqHashId(): Promise<string> {
    const res = await this.findOne({
      order: [['id', 'DESC']],
      attributes: ['id'],
    });

    const id = _.get(res, 'id', 0);

    return hashids.encode(id + 1);
  }
}

export default function ChatEmotionSecretSignalDefinition(
  Sequelize: Orm,
  db: DBInstance
) {
  ChatEmotionSecretSignal.init(
    {
      uuid: {
        type: Sequelize.UUID,
        required: true,
        defaultValue: Sequelize.UUIDV1,
      },
      code: {
        type: Sequelize.STRING,
        required: true,
      },
    },
    {
      tableName: 'chat_emotion_secret_signal',
      sequelize: db,
    }
  );

  ChatEmotionSecretSignal.belongsTo(ChatEmotionCatalog, { as: 'catalog' });

  const User = db.models.player_user as any;
  if (!!User) {
    ChatEmotionSecretSignal.belongsTo(User, { as: 'creator' });
  }

  return ChatEmotionSecretSignal;
}
