import { Model, Orm, DBInstance } from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';

export class FileAvatar extends Model {
  uuid: string;
  name: string;
  size: number;
  width: number;
  height: number;
  type: 'actor' | 'user' | 'group';
  has_thumbnail: boolean;
  attach_uuid: string;
  owner_uuid: string;
  createdAt: Date;
  updatedAt: Date;

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
      type: { type: Sequelize.ENUM('actor', 'user', 'group') },
      has_thumbnail: { type: Sequelize.BOOLEAN, defaultValue: false },
      attach_uuid: { type: Sequelize.STRING },
      owner_uuid: { type: Sequelize.STRING },
    },
    {
      tableName: 'file_avatar',
      sequelize: db,
    }
  );

  FileAvatar.belongsTo(PlayerUser, { as: 'owner' });

  return FileAvatar;
}
