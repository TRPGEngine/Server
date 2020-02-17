import { Model, Orm, DBInstance, Op } from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';
import _ from 'lodash';

export class FileAvatar extends Model {
  uuid: string;
  name: string;
  size: number;
  width: number;
  height: number;
  type: 'actor' | 'user' | 'group' | 'groupActor';
  has_thumbnail: boolean;
  attach_uuid: string;
  owner_uuid: string;
  createdAt: Date;
  updatedAt: Date;

  /**
   * 绑定关联UUID
   * @param avatarUUID 头像UUID
   * @param attachUUID 关联UUID
   * @param playerUUID 操作人UUID
   */
  static async bindAttachUUID(
    avatarUUID: string,
    attachUUID: string,
    playerUUID: string
  ): Promise<FileAvatar> {
    const avatar: FileAvatar = await FileAvatar.findOne({
      where: {
        uuid: avatarUUID,
        owner_uuid: playerUUID,
      },
    });

    if (_.isNil(avatar)) {
      throw new Error('该头像数据不存在');
    }
    avatar.attach_uuid = attachUUID;
    await avatar.save();

    // 移除旧的关联关系
    await FileAvatar.update(
      {
        attach_uuid: null,
      },
      {
        where: {
          uuid: {
            [Op.not]: avatar.uuid,
          },
          attach_uuid: {
            [Op.not]: null,
          },
          type: avatar.type,
        },
      }
    );

    return avatar;
  }

  getObject() {
    return {
      uuid: this.uuid,
      name: this.name,
      type: this.type,
      attach_uuid: this.attach_uuid,
      owner_uuid: this.owner_uuid,
      createdAt: this.createdAt,
    };
  }
}

export default function FileAvatarDefinition(Sequelize: Orm, db: DBInstance) {
  FileAvatar.init(
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      name: { type: Sequelize.STRING, allowNull: false },
      size: { type: Sequelize.INTEGER, allowNull: false },
      width: { type: Sequelize.INTEGER },
      height: { type: Sequelize.INTEGER },
      type: { type: Sequelize.ENUM('actor', 'user', 'group', 'groupActor') },
      has_thumbnail: { type: Sequelize.BOOLEAN, defaultValue: false },
      attach_uuid: { type: Sequelize.STRING },
      owner_uuid: { type: Sequelize.STRING },
    },
    {
      tableName: 'file_avatar',
      sequelize: db,
      paranoid: true,
    }
  );

  FileAvatar.belongsTo(PlayerUser, { as: 'owner' });

  return FileAvatar;
}
