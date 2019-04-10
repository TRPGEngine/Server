module.exports = function Record(Sequelize, db) {
  let Record = db.define('mail_record', {
    user_uuid: {type: Sequelize.UUID, required: true},
    from: {type: Sequelize.STRING, required: true},
    to: {type: Sequelize.STRING, required: true},
    subject: {type: Sequelize.STRING, required: true},
    body: {type: Sequelize.TEXT},
    host: {type: Sequelize.STRING, required: true},
    port: {type: Sequelize.STRING, required: true},
    secure: {type: Sequelize.BOOLEAN, defaultValue: true},
    is_success: {type: Sequelize.BOOLEAN, defaultValue: true},
    data: {type: Sequelize.JSON},
    error: {type: Sequelize.STRING(1000)},
  }, {
    hooks: {
    },
    methods: {

    }
  });

  return Record;
}
