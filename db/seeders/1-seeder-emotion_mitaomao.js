'use strict';
/**
 * 1-seeder-emotion_mitaomao.js.js
 * 增加蜜桃猫表情包
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const uuid = require('uuid/v1');
const _ = require('lodash');
const rootDir = path.resolve(__dirname, '../../');
const mitaomaoDir = path.resolve(__dirname, './emotion/mitaomao/');
const publicDir = path.resolve(rootDir, 'public/');
const targetDir = path.resolve(
  publicDir,
  'uploads/persistence/emotions/mitaomao/'
);

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 确保文件夹存在
    await fs.ensureDir(targetDir);

    const gifs = glob('*.gif', { cwd: mitaomaoDir, sync: true });

    const pathList = [];
    for (const gif of gifs) {
      const targetPath = path.resolve(targetDir, gif);
      await fs.copyFile(path.resolve(mitaomaoDir, gif), targetPath);
      pathList.push(targetPath);
    }

    const relativePathList = pathList.map((p) => path.relative(publicDir, p));
    // 每24个一组
    const catalogs = _.chunk(relativePathList, 24);
    for (let index = 0; index < catalogs.length; index++) {
      const paths = catalogs[index].map((p) => '/' + p.replace(/\\/g, '/'));
      const catalogName = `mitaomao${index + 1}`;
      console.log('dumping emotion catalog:', catalogName);

      const id = await queryInterface.bulkInsert('chat_emotion_catalog', [
        {
          uuid: uuid(),
          name: catalogName,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      await queryInterface.bulkInsert(
        'chat_emotion_item',
        paths.map((p) => {
          return {
            uuid: uuid(),
            name: '蜜桃猫' + path.basename(p, path.extname(p)),
            url: p,
            createdAt: new Date(),
            updatedAt: new Date(),
            catalogId: id,
          };
        })
      );
    }
  },
  down: (queryInterface, Sequelize) => {
    // Optional, here code your db remove row
  },
};
