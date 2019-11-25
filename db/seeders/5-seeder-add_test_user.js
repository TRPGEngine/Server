import { PlayerUser } from '../../packages/Player/lib/models/user';
import md5Encrypt from '../../packages/Player/lib/utils/md5';

('use strict');
/**
 * 5-seeder-add_test_user.js
 * 创建测试用户 admin1~admin10
 */

module.exports = {
  up: async (queryInterface, Sequelize, { app }) => {
    // Here create your db insert row
    const db = app.storage.db;

    const testUsers = Array.from({ length: 10 }).map((_, index) => {
      const salt = PlayerUser.genSalt();
      const password = PlayerUser.genPassword(md5Encrypt('admin'), salt);

      return {
        username: `admin${index + 1}`,
        password,
        salt,
      };
    });

    for (const user of testUsers) {
      await db.models.player_user
        .create(user)
        .then(() => console.log(`测试用户[${user.username}]创建成功`))
        .catch((err) =>
          console.log(`测试用户[${user.username}]创建失败, 跳过`)
        );
    }
  },
  down: (queryInterface, Sequelize) => {
    // Optional, here code your db remove row
  },
};
