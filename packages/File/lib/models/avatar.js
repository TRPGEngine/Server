module.exports = function Avatar(Sequelize, db) {
  let Avatar = db.define('file_avatar', {
    uuid: {type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1},
    name: {type: Sequelize.STRING, require: true},
    size: {type: Sequelize.INTEGER, require: true},
    width: {type: Sequelize.INTEGER},
    height: {type: Sequelize.INTEGER},
    type: {type: Sequelize.ENUM('actor', 'user', 'group')},
    has_thumbnail: {type: Sequelize.BOOLEAN, defaultValue: false},
    attach_uuid: {type: Sequelize.STRING},
  }, {
    methods: {
      getObject: function() {
        return {
          uuid: this.uuid,
          name: this.name,
          type: this.type,
          createAt: this.createAt,
          attach_uuid: this.attach_uuid,
        }
      }
    }
  })

  let User = db.models.player_user;
  if(!!User) {
    // Avatar.hasOne('owner', User, {reverse: 'avatar_file'});
    Avatar.belongsTo(User, {as: 'owner'});
  }

  return Avatar;
}
