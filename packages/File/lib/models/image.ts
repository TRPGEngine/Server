import { PlayerUser } from 'packages/Player/lib/models/user';
import { Model, Orm, DBInstance } from 'trpg/core';

/**
 * 这个模型是用于持久化存储图片信息的模型
 *
 * 用于 note, map 等
 */
export class FileImage extends Model {
  uuid: string;
  name: string;
  size: number;
  width: number;
  height: number;
  usage: string;
  attach_uuid: string;
  owner_uuid: string;
}

export default function FileImageDefinition(Sequelize: Orm, db: DBInstance) {
  FileImage.init(
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      name: { type: Sequelize.STRING, allowNull: false },
      size: { type: Sequelize.INTEGER, allowNull: false },
      width: { type: Sequelize.INTEGER },
      height: { type: Sequelize.INTEGER },
      usage: { type: Sequelize.STRING }, // chat用于处理需要持久化存储聊天图片的场景
      attach_uuid: { type: Sequelize.STRING }, // 相关UUID 可能为note的UUID 也可能为地图的UUID
      owner_uuid: { type: Sequelize.STRING },
    },
    {
      tableName: 'file_image',
      sequelize: db,
      paranoid: true,
    }
  );

  FileImage.belongsTo(PlayerUser, { as: 'owner' });

  return FileImage;
}
