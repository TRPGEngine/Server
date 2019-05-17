module.exports = function NotifyHistory(Sequelize, db) {
  let NotifyHistory = db.define(
    'notify_history',
    {
      type: {
        type: Sequelize.ENUM('jpush'),
        required: true,
      },
      platform: {
        type: Sequelize.ENUM('all', 'android', 'ios'),
      },
      registration_id: {
        type: Sequelize.STRING,
      },
      user_uuid: {
        type: Sequelize.UUID,
      },
      user_tags: {
        type: Sequelize.JSON,
      },
      notification: {
        type: Sequelize.STRING,
      },
      message: {
        type: Sequelize.STRING,
      },
    },
    {
      methods: {},
    }
  );

  return NotifyHistory;
};
