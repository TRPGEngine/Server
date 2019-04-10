module.exports = function ChatConverse(Sequelize, db) {
  let ChatConverse = db.define('chat_converse', {
    uuid: {type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, required: true},
    type: {type: Sequelize.ENUM('user', 'channel', 'group', 'system'), defaultValue: 'user'},
    name: {type: Sequelize.STRING},
    icon: {type: Sequelize.STRING},
  }, {
    validations: {
      // uuid: orm.enforce.unique({ scope: ['owner_id'] }, 'uuid already taken!'),
    },
    hooks: {

    },
    methods: {

    }
  });

  let User = db.models.player_user;
  if(!!User) {
    ChatConverse.belongsTo(User, {as: 'owner'});

    User.belongsToMany(ChatConverse, {through: 'chat_converse_participants', as: 'converses'})
    ChatConverse.belongsToMany(User, {through: 'chat_converse_participants', as: 'participants'})
  }

  return ChatConverse;
}
