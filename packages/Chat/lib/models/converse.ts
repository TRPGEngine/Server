import {
  Model,
  DBInstance,
  Orm,
  BelongsToSetAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyGetAssociationsMixin,
} from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';
import _ from 'lodash';

export type ChatConverseType =
  | 'user'
  | 'channel'
  | 'group'
  | 'system'
  | 'multiuser'; // 多用户

/**
 * 多人会话的模型
 */
export class ChatConverse extends Model {
  uuid: string;
  type: ChatConverseType;
  name: string;
  icon: string;

  setOwner: BelongsToSetAssociationMixin<PlayerUser, number>;
  addParticipants: BelongsToManyAddAssociationsMixin<PlayerUser, number>;
  getParticipants: BelongsToManyGetAssociationsMixin<PlayerUser>;

  /**
   * 创建多人会话
   */
  static async createMultiConverse(name: string, userUUIDs: string[]) {
    const num = userUUIDs.length;

    if (num < 3) {
      throw new Error('创建多人会话的人数不能少于三人');
    }
    if (num > 20) {
      throw new Error('创建多人会话的人数过多');
    }

    const users: PlayerUser[] = await Promise.all(
      userUUIDs.map((uuid) => PlayerUser.findByUUID(uuid))
    );

    if (_.isEmpty(name)) {
      // 生成默认会话名
      let defaultName = _.take(users, 3)
        .map((u) => u.getName())
        .join(',');
      if (userUUIDs.length > 3) {
        defaultName += '等人';
      }

      defaultName += '的多人会话';

      name = defaultName;
    }

    const trpgapp = ChatConverse.getApplication();
    return await trpgapp.storage.transaction(
      'createMultiConverse',
      async (transaction) => {
        const converse: ChatConverse = await ChatConverse.create(
          {
            type: 'multiuser',
            name,
          },
          {
            transaction,
          }
        );
        await converse.addParticipants(users, {
          transaction,
        });

        return converse;
      }
    );
  }
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
        type: Sequelize.ENUM('user', 'channel', 'group', 'system', 'multiuser'),
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
