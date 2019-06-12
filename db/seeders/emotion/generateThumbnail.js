/**
 * 完全独立的脚本
 * 用于生产临时的缩略图
 */

const images = require('../../../packages/File/node_modules/images');
const glob = require('glob');
const path = require('path');
const _ = require('lodash');
const fs = require('fs-extra');

const mitaomaoDir = path.resolve(__dirname, './mitaomao');

const gifList = glob('*.gif', {
  cwd: mitaomaoDir,
  sync: true,
});

const thumbnailList = _.chunk(gifList, 24).map((l) => _.head(l));
fs.ensureDirSync(path.resolve(mitaomaoDir, './thumbnail'));

for (const fileName of thumbnailList) {
  const targetName = _.head(fileName.split('.'));

  console.log('generate file', targetName);
  images(path.resolve(mitaomaoDir, fileName))
    .resize(64, 64)
    .save(path.resolve(mitaomaoDir, './thumbnail', `${targetName}.png`));
}

console.log('completed!');
