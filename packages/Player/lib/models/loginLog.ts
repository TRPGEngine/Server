import { Orm, DBInstance } from 'trpg/core';

module.exports = function LoginLog(Sequelize: Orm, db: DBInstance) {
  let LoginLog = db.define('player_login_log', {
    user_uuid: { type: Sequelize.STRING },
    user_name: { type: Sequelize.STRING },
    type: {
      type: Sequelize.ENUM('standard', 'token', 'app_standard', 'app_token'),
      required: true,
    },
    channel: { type: Sequelize.STRING },
    socket_id: { type: Sequelize.STRING },
    ip: { type: Sequelize.STRING },
    ip_address: { type: Sequelize.STRING },
    platform: { type: Sequelize.STRING },
    device_info: { type: Sequelize.JSON },
    is_success: { type: Sequelize.BOOLEAN },
    token: { type: Sequelize.STRING },
    offline_date: { type: Sequelize.DATE },
  });

  return LoginLog;
};
