module.exports = function Actor(Sequelize, db) {
  let Actor = db.define('actor_actor', {
    uuid: {type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1},
    name: {type: Sequelize.STRING, require: true},
    desc: {type: Sequelize.STRING},
    avatar: {type: Sequelize.STRING},
    template_uuid: {type: Sequelize.STRING, required: true},
    info: {type: Sequelize.JSON},
  }, {
    paranoid: true,
    methods: {
      getObject: function() {
        return {
          name: this.name,
          desc: this.desc,
          avatar: this.avatar,
          uuid: this.uuid,
          template_uuid: this.template_uuid,
          info: this.info,
        }
      }
    }
  })

  let User = db.models.player_user;
  if(!!User) {
    // Actor.hasOne('owner', User, {reverse: 'actors'});
    Actor.belongsTo(User, {
      foreignKey: 'ownerId',
      as: 'owner'
    });
    User.hasMany(Actor, {
      foreignKey: 'ownerId',
      as: 'actors'
    })
  }

  return Actor;
}
