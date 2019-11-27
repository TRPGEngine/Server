import { Orm, DBInstance, Model } from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';

export class FileChatimg extends Model {
  uuid: string;
  name: string;
  url: string;
  size: number;
  width: number;
  type: 'file' | 'url';
  has_thumbnail: boolean;
  mimetype: string;
  encoding: string;
  ext: {};
  createdAt: Date;
  updatedAt: Date;

  getObject() {
    return {
      uuid: this.uuid,
      name: this.name,
      url: this.url,
      createdAt: this.createdAt,
    };
  }
}

export default function FileChatimgDefinition(Sequelize: Orm, db: DBInstance) {
  FileChatimg.init(
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      name: { type: Sequelize.STRING, allowNull: false },
      url: { type: Sequelize.STRING },
      size: { type: Sequelize.INTEGER, allowNull: false },
      width: { type: Sequelize.INTEGER },
      height: { type: Sequelize.INTEGER },
      type: { type: Sequelize.ENUM('file', 'url') },
      has_thumbnail: { type: Sequelize.BOOLEAN, defaultValue: false },
      mimetype: { type: Sequelize.STRING },
      encoding: { type: Sequelize.STRING },
      ext: { type: Sequelize.JSON },
    },
    {
      tableName: 'file_chatimg',
      sequelize: db,
    }
  );

  FileChatimg.belongsTo(PlayerUser, { as: 'owner' });

  return FileChatimg;
}
