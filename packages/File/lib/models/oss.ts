import { Model, DBInstance, Orm } from 'trpg/core';

// TODO: 暂时没有任何使用逻辑

/**
 * 记录存储到远程对象存储服务的模型
 * 目前接入:
 * - qiniu
 */

export class FileOSS extends Model {}

export default function FileOSSDefinition(Sequelize: Orm, db: DBInstance) {
  FileOSS.init(
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      platform: { type: Sequelize.ENUM('qiniu'), allowNull: false },
      bucket: { type: Sequelize.STRING },
      key: { type: Sequelize.STRING },
      hash: { type: Sequelize.STRING },
      size: { type: Sequelize.INTEGER },
      mimetype: { type: Sequelize.STRING },
      extra_data: {
        type: Sequelize.JSON,
        comment: '额外信息，如图片的信息之类的',
      },
    },
    {
      tableName: 'file_oss',
      sequelize: db,
    }
  );

  const File = db.models.file_file;
  if (File) {
    FileOSS.belongsTo(File, { as: 'file' });
  }

  return FileOSS;
}
