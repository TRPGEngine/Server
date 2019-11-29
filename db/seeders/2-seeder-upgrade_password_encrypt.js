'use strict';
/**
 * 2-seeder-upgrade_password_encrypt.js
 * 为没有salt的用户增加salt并增加sha1加密
 */
const sha1 = require('../../packages/Player/lib/utils/sha1').default;

module.exports = {
  up: async (queryInterface, Sequelize, { app }) => {
    const db = app.storage.db;
    const User = db.models.player_user;

    const users = await User.findAll({
      where: {
        salt: null,
      },
    });

    console.log('需要更新密码加密方式用户数量:', users.length);

    for (const user of users) {
      const salt = User.genSalt();
      const originPassword = user.password;
      const newPassword = sha1(originPassword + salt);

      user.salt = salt;
      user.password = newPassword;
      await user.save();

      console.log(
        `更新用户${user.id}成功: 原始密码:`,
        originPassword,
        '新密码:',
        newPassword,
        '盐值',
        salt
      );
    }

    console.log('密码升级完成');
  },
  down: (queryInterface, Sequelize) => {
    // Optional, here code your db remove row
  },
};
