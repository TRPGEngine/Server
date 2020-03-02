'use strict';
/**
 * 3-seeder-dump_builtin_actor_template.js
 *
 */

const path = require('path');
const fs = require('fs-extra');
const layoutDir = path.resolve(__dirname, './layout/');
const dirs = fs.readdirSync(layoutDir);

const records = [];
for (const name of dirs) {
  const manifest = fs.readJsonSync(
    path.resolve(layoutDir, name, 'manifest.json')
  );
  const layout = fs.readFileSync(path.resolve(layoutDir, name, 'layout.xml'), {
    encoding: 'utf-8',
  });

  records.push({
    name: manifest.name,
    desc: manifest.desc,
    layout,
    built_in: true,
  });
}

module.exports = {
  up: async (queryInterface, Sequelize, { app }) => {
    // 先移除所有的built-in的字段
    const db = app.storage.db;
    await db.models.actor_template.destroy({ where: { built_in: true } });

    for (const record of records) {
      const name = record.name;
      console.log('handle dump built-in template:', name);
      const template = await db.models.actor_template.findOne({
        where: {
          name,
          built_in: true,
        },
        paranoid: false,
      });
      if (template) {
        // 已存在，更新其他内容
        console.log('update template');
        await template.restore();
        template.desc = record.desc;
        template.layout = record.layout;
        template.deletedAt = null;
        await template.save();
      } else {
        // 不存在, 创建
        console.log('create template');
        await db.models.actor_template.create(record);
      }

      console.log('===============');
    }
  },
  down: (queryInterface, Sequelize) => {
    // Optional, here code your db remove row
  },
};
