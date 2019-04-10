module.exports = function Avatar(Sequelize, db) {
  let Image = db.define('file_chatimg', {
    uuid: {type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1},
    name: {type: Sequelize.STRING, require: true},
    url: {type: Sequelize.STRING},
    size: {type: Sequelize.INTEGER, require: true},
    width: {type: Sequelize.INTEGER},
    height: {type: Sequelize.INTEGER},
    type: {type: Sequelize.ENUM('file', 'url')},
    has_thumbnail: {type: Sequelize.BOOLEAN, defaultValue: false},
    mimetype: {type: Sequelize.STRING},
    encoding: {type: Sequelize.STRING},
    ext: {type: Sequelize.JSON}
  }, {
    methods: {
      getObject: function() {
        return {
          uuid: this.uuid,
          name: this.name,
          url: this.url,
          createAt: this.createAt,
        }
      }
    }
  })

  let User = db.models.player_user;
  if(!!User) {
    Image.belongsTo(User, {as: 'owner'});
    // Avatar.hasOne('owner', User, {reverse: 'chat_image'});
  }

  return Image;
}
