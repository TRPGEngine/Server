module.exports = function List(Sequelize, db) {
  let List = db.define('mail_list', {
    user_uuid: {type: Sequelize.UUID, required: true},
    email_address: {
      type: Sequelize.STRING,
      required: true,
      validate: {isEmail: true}
    },
    email_user: {type: Sequelize.STRING},
    email_provider: {type: Sequelize.STRING},
    enabled: {type: Sequelize.BOOLEAN, defaultValue: false},
  }, {
    hooks: {
      beforeCreate: function() {
        if (!this.email_user) {
          this.email_user = this.email_address.split('@')[0]
        }
        if (!this.email_provider) {
          this.email_provider = this.email_address.split('@')[1]
        }
      },
      beforeSave: function() {
        if (!this.email_user) {
          this.email_user = this.email_address.split('@')[0]
        }
        if (!this.email_provider) {
          this.email_provider = this.email_address.split('@')[1]
        }
      },
    },
    methods: {

    }
  });

  let User = db.models.player_user;
  if(!!User) {
    // List.hasOne('owner', User, { reverse: "mail" });
    List.belongsTo(User, {
      foreignKey: 'ownerId',
      as: 'owner'
    });
    User.hasOne(List, {
      foreignKey: 'ownerId',
      as: 'mail'
    });
  }

  return List;
}
