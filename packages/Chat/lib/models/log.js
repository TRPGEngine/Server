module.exports = function Log(Sequelize, db) {
  let ChatLog = db.define('chat_log', {
    uuid: {type: Sequelize.UUID, required: true, defaultValue: Sequelize.UUIDV4},
    sender_uuid: {type: Sequelize.STRING, required: true},
    to_uuid: {type: Sequelize.STRING},
    converse_uuid: {type: Sequelize.STRING},
    message: {type: Sequelize.STRING(1000)},
    type: {type: Sequelize.ENUM('normal', 'system', 'ooc', 'speak', 'action', 'cmd', 'card', 'tip', 'file')},
    data: {type: Sequelize.JSON},
    is_group: {type: Sequelize.BOOLEAN, defaultValue: false},
    is_public: {type: Sequelize.BOOLEAN, defaultValue: true},
    date: {type: Sequelize.DATE}
  }, {
    hooks: {
      
    },
    methods: {

    }
  });

  return ChatLog;
}
