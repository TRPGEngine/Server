'use strict';
/**
 * 1-seeder-emotion_mitaomao.js.js
 * 增加蜜桃猫表情包
 * NOTE: 需要人工把蜜桃猫表情包上传到oss中。key为emotion/mitaomao/001.gif 格式
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const uuid = require('uuid/v1');
const _ = require('lodash');
const config = require('config');
// const rootDir = path.resolve(__dirname, '../../');
// const mitaomaoDir = path.resolve(__dirname, './emotion/mitaomao/');
// const publicDir = path.resolve(rootDir, 'public/');
// const targetDir = path.resolve(
//   publicDir,
//   'uploads/persistence/emotions/mitaomao/'
// );

const sizeNum = 144;
const groupNum = 24;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const ossDomain = _.get(config, 'file.oss.qiniu.domain');
    if (!ossDomain) {
      throw new Error('cant get oss domain from file.oss.qiniu.domain');
    }
    const allKey = _.range(sizeNum).map((num) => ({
      name: `蜜桃猫${_.padStart(num + 1, 3)}`,
      key: `emotion/mitaomao/${_.padStart(num + 1, 3, '0')}.gif`,
    }));
    const catalogs = _.chunk(allKey, groupNum); // 每24个一组

    for (let i = 0; i < catalogs.length; i++) {
      const catalog = catalogs[i];
      const catalogName = `mitaomao${i + 1}`;
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
        catalog.map((item) => {
          return {
            uuid: uuid(),
            name: item.name,
            url: ossDomain + item.key,
            createdAt: new Date(),
            updatedAt: new Date(),
            catalogId: id,
          };
        })
      );
    }

    // ============= 以下是之前的代码。暂时注释。改为应用七牛云
    // 确保文件夹存在
    // await fs.ensureDir(targetDir);
    // const gifs = glob('*.gif', { cwd: mitaomaoDir, sync: true });
    // const pathList = [];
    // for (const gif of gifs) {
    //   const targetPath = path.resolve(targetDir, gif);
    //   await fs.copyFile(path.resolve(mitaomaoDir, gif), targetPath);
    //   pathList.push(targetPath);
    // }
    // const relativePathList = pathList.map((p) => path.relative(publicDir, p));
    // // 每24个一组
    // const catalogs = _.chunk(relativePathList, 24);
    // for (let index = 0; index < catalogs.length; index++) {
    //   const paths = catalogs[index].map((p) => '/' + p.replace(/\\/g, '/'));
    //   const catalogName = `mitaomao${index + 1}`;
    //   console.log('dumping emotion catalog:', catalogName);
    //   const id = await queryInterface.bulkInsert('chat_emotion_catalog', [
    //     {
    //       uuid: uuid(),
    //       name: catalogName,
    //       createdAt: new Date(),
    //       updatedAt: new Date(),
    //     },
    //   ]);
    //   await queryInterface.bulkInsert(
    //     'chat_emotion_item',
    //     paths.map((p) => {
    //       return {
    //         uuid: uuid(),
    //         name: '蜜桃猫' + path.basename(p, path.extname(p)),
    //         url: p,
    //         createdAt: new Date(),
    //         updatedAt: new Date(),
    //         catalogId: id,
    //       };
    //     })
    //   );
    // }
  },
  down: (queryInterface, Sequelize) => {
    // Optional, here code your db remove row
  },
};
