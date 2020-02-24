import { Model, DBInstance, Orm } from 'trpg/core';
import * as qiniu from '../utils/qiniu';
import path from 'path';
import { FileType } from '../types';

// TODO: 暂时没有任何使用逻辑

/**
 * 记录存储到远程对象存储服务的模型
 * 目前接入:
 * - qiniu
 */

export class FileOSS extends Model {
  /**
   * 上传文件到远程OSS
   * @param filepath 文件的本地路径
   */
  static async upload(type: FileType, filepath: string): Promise<FileOSS> {
    const trpgapp = FileOSS.getApplication();
    const storage = trpgapp.get('file.storage');

    if (storage === 'qiniu') {
      const basename = path.basename(filepath);
      const file = await qiniu.putFile(`${type}/${basename}`, filepath);
      return await FileOSS.create({
        platform: 'qiniu',
        bucket: qiniu.bucket,
        key: file.key,
        hash: file.hash,
        size: file.fsize,
        mimetype: file.mimeType,
        extra_data: { imageInfo: file.imageInfo },
      });
    }
  }
}

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
