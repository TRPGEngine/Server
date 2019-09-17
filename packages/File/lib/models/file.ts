import path from 'path';
import config from '../config';

export default function FileFileDefinition(Sequelize, db) {
  let File = db.define(
    'file_file',
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      name: { type: Sequelize.STRING, require: true },
      originalname: { type: Sequelize.STRING, require: true },
      size: { type: Sequelize.INTEGER, require: true },
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
      hooks: {
        beforeCreate: function(file) {
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
      methods: {
        getPreviewUrl: function(apihost) {
          const ext = this.ext;

          if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
            // 是office文件
            return config.getOfficePreviewUrl(apihost + this.getDownloadUrl());
          } else if (['.pdf', 'jpg', 'png'].includes(ext)) {
            return apihost + this.getDownloadUrl();
          } else {
            return '';
          }
        },
        getDownloadUrl: function() {
          return `/file/download/${this.uuid}/${this.originalname}`;
        },
        getUploadUrl: function() {
          if (this.path && this.path.startsWith('public')) {
            // this.path地址为public开头的数据
            const seg = this.path.split(path.sep);
            return '/' + seg.splice(1).join('/'); // 移除第一段并返回用斜线连接后的剩余部分
          }

          const name = this.name;
          const catalog = this.is_persistence ? 'persistence' : 'temporary';
          return `/uploads/${catalog}/${name}`;
        },
        getObject: function() {
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
            createAt: this.createAt,
            owner_uuid: this.owner_uuid,
            upload_url: this.getUploadUrl(),
          };
        },
      },
    }
  );

  let User = db.models.player_user;
  if (!!User) {
    File.belongsTo(User, { as: 'owner' });
  }

  return File;
}
