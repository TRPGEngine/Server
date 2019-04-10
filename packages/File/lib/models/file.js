const config = require('../config');

module.exports = function File(Sequelize, db) {
  let File = db.define('file_file', {
    uuid: {type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1},
    name: {type: Sequelize.STRING, require: true},
    originalname: {type: Sequelize.STRING, require: true},
    size: {type: Sequelize.INTEGER, require: true},
    encoding: {type: Sequelize.STRING},
    mimetype: {type: Sequelize.STRING},
    ext: {type: Sequelize.STRING},
    type: {type: Sequelize.ENUM('file')},
    can_preview: {type: Sequelize.BOOLEAN, defaultValue: false},
    is_persistence: {type: Sequelize.BOOLEAN, defaultValue: false},
    is_expired: {type: Sequelize.BOOLEAN, defaultValue: false},
    owner_uuid: {type: Sequelize.STRING},
  }, {
    hooks: {
      beforeCreate: function() {
        if (!this.ext) {
          if(this.name.indexOf('.') >= 0) {
            let tmp = this.name.split('.');
            this.ext = tmp[tmp.length - 1];
          }else {
            this.ext = '';
          }
        }
        this.ext = this.ext.toLowerCase();
        if (!this.can_preview) {
          // 数据可能为默认值。创建时不管怎么样都检测一遍
  				this.can_preview = config.canPreviewExt.indexOf(this.ext) >= 0;
  			}
      }
    },
    methods: {
      getPreviewUrl: function(apihost) {
        if(['doc','docx','xls','xlsx','ppt','pptx'].indexOf(this.ext) >= 0) {
          // 是office文件
          return config.getOfficePreviewUrl(apihost + this.getDownloadUrl())
        }else if(['.pdf', 'jpg', 'png']) {
          return apihost + this.getDownloadUrl()
        }else {
          return ''
        }
      },
      getDownloadUrl: function() {
        return `/file/download/${this.uuid}/${this.originalname}`
      },
      getObject: function() {
        return {
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
        }
      }
    }
  })

  let User = db.models.player_user;
  if(!!User) {
    File.belongsTo(User, {as: 'owner'});
  }

  return File;
}
