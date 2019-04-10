module.exports = function OAuthQQ(Sequelize, db) {
  let OAuthQQ = db.define('oauth_qq_access_info', {
    access_token: {type: Sequelize.STRING, required: true},
    expires_in: {type: Sequelize.INTEGER, required: true},
    refresh_token: {type: Sequelize.STRING, required: true},
    openid: {type: Sequelize.STRING, required: true},
  }, {
    hooks: {
    },
    methods: {

    }
  });

  let User = db.models.player_user;
  if(!!User) {
    OAuthQQ.belongsTo(User, {as: 'relatedUser'});
  }

  return OAuthQQ;
}
