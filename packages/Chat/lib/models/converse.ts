import {
  Model,
  DBInstance,
  Orm,
  BelongsToSetAssociationMixin,
} from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';

export type ChatConverseType = 'user' | 'channel' | 'group' | 'system';

export class ChatConverse extends Model {
  uuid: string;
  type: ChatConverseType;
  name: string;
  icon: string;

  setOwner: BelongsToSetAssociationMixin<PlayerUser, number>;
}

export default function ChatConverseDefinition(Sequelize: Orm, db: DBInstance) {
  ChatConverse.init(
    {
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        required: true,
      },
      type: {
        type: Sequelize.ENUM('user', 'channel', 'group', 'system'),
        defaultValue: 'user',
      },
      name: { type: Sequelize.STRING },
      icon: { type: Sequelize.STRING },
    },
    {
      tableName: 'chat_converse',
      sequelize: db,
    }
  );

  let User = db.models.player_user;
  if (!!User) {
    ChatConverse.belongsTo(User, { as: 'owner' });

    User.belongsToMany(ChatConverse, {
      through: 'chat_converse_participants',
      as: 'converses',
    });
    ChatConverse.belongsToMany(User, {
      through: 'chat_converse_participants',
      as: 'participants',
    });
  }

  return ChatConverse;
}
