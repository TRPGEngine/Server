'use strict';
/**
 * 3-seeder-add_actor_template.js
 *
 */

const path = require('path');
const fs = require('fs-extra');
const layoutDir = path.resolve(__dirname, './layout/');
const dirs = fs.readdirSync(layoutDir);

const records = [];
for (const name of dirs) {
  const info = fs.readJsonSync(path.resolve(layoutDir, name, 'info.json'));
  const layout = fs.readFileSync(path.resolve(layoutDir, name, 'layout.xml'), {
    encoding: 'utf-8',
  });

  records.push({
    name: info.name,
    desc: info.desc,
    info: JSON.stringify(info),
    layout,
    built_in: true,
  });
}

module.exports = {
  up: async (queryInterface, Sequelize, { app }) => {
    // 移除所有的built-in的字段
    await queryInterface.bulkDelete('actor_template', { built_in: true });
    const db = app.storage.db;

    // TODO: 之后可以考虑优化为更新而不是删除后增加
    await db.models.actor_template.bulkCreate(records);
  },
  down: (queryInterface, Sequelize) => {
    // Optional, here code your db remove row
  },
};
