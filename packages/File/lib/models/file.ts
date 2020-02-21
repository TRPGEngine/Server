import path from 'path';
import config from '../config';
import { Model, Orm, DBInstance } from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';

export class FileFile extends Model {
  id: number;
  uuid: string;
  name: string;
  originalname: string;
  size: number;
  encoding: string;
  mimetype: string;
  ext: string;
  type: string;
  path: string;
  can_preview: boolean;
  is_persistence: boolean;
  is_expired: boolean;
  owner_uuid: string;
  createdAt: Date;
  updatedAt: Date;

  getPreviewUrl(apihost) {
    const ext = this.ext;

    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
      // 是office文件
      return config.getOfficePreviewUrl(apihost + this.getDownloadUrl());
    } else if (['.pdf', 'jpg', 'png'].includes(ext)) {
      return apihost + this.getDownloadUrl();
    } else {
      return '';
    }
  }

  getDownloadUrl() {
    return `/file/download/${this.uuid}/${this.originalname}`;
  }

  getUploadUrl() {
    if (this.path && this.path.startsWith('public')) {
      // this.path地址为public开头的数据
      const seg = this.path.split(path.sep);
      return '/' + seg.splice(1).join('/'); // 移除第一段并返回用斜线连接后的剩余部分
    }

    const name = this.name;
    const catalog = this.is_persistence ? 'persistence' : 'temporary';
    return `/uploads/${catalog}/${name}`;
  }

  getObject() {
    return {
      id: this.id,
      fileuuid: this.uuid,
      originalname: this.originalname,
      size: this.size,
      ext: this.ext,
      mimetype: this.mimetype,
      type: this.type,
      can_preview: this.can_preview,
      is_persistence: this.is_persistence,
      createdAt: this.createdAt,
      owner_uuid: this.owner_uuid,
      upload_url: this.getUploadUrl(),
    };
  }
}

export default function FileFileDefinition(Sequelize: Orm, db: DBInstance) {
  FileFile.init(
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      name: { type: Sequelize.STRING, allowNull: false },
      originalname: { type: Sequelize.STRING, allowNull: false },
      size: { type: Sequelize.INTEGER, allowNull: false },
      encoding: { type: Sequelize.STRING },
      mimetype: { type: Sequelize.STRING },
      ext: { type: Sequelize.STRING },
      type: { type: Sequelize.STRING },
      path: { type: Sequelize.STRING },
      can_preview: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_persistence: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_expired: { type: Sequelize.BOOLEAN, defaultValue: false },
      owner_uuid: { type: Sequelize.STRING },
    },
    {
      tableName: 'file_file',
      sequelize: db,
      paranoid: true,
      hooks: {
        beforeCreate(file) {
          if (!file.ext) {
            if (file.name.indexOf('.') >= 0) {
              let tmp = file.name.split('.');
              file.ext = tmp[tmp.length - 1];
            } else {
              file.ext = '';
            }
          }
          file.ext = file.ext.toLowerCase();
          if (!file.can_preview) {
            // 数据可能为默认值。创建时不管怎么样都检测一遍
            file.can_preview = config.canPreviewExt.indexOf(file.ext) >= 0;
          }
        },
      },
    }
  );

  FileFile.belongsTo(PlayerUser, { as: 'owner' });

  return FileFile;
}
