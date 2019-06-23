const { getProjectPath } = require('../utils');
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

const pattern = '*[0-9]-seeder-*.js';
const seederDir = getProjectPath('./db/seeders/');

exports.command = 'generate-seeder';
exports.desc = 'generate a blank db seeder';
exports.builder = function(args) {
  return args
    .usage('$0 generate-seeder --name [name] <options>')
    .string(['name', 'comment'])
    .demandOption('name', 'Require seed name to generate')
    .default('comment', '').argv;
};
exports.handler = async function(argv) {
  const { name, comment } = argv;
  if (!name) {
    // name 不存在
    console.error('Error: Require Seed Name');
    return;
  }

  // 获取文件夹下所有的文件
  const seederFiles = glob(pattern, {
    cwd: seederDir,
    sync: true,
  });
  const maxIndex = Math.max(
    ...seederFiles.map((filename) => Number(filename.split('-')[0])),
    0
  ); // 返回最大index, 如果没有匹配文件返回 0
  const curIndex = maxIndex + 1;
  const curFileName = `${curIndex}-seeder-${name}.js`;
  const curFileContent = `'use strict';
/**
 * ${curFileName}
 * ${comment}
 */

module.exports = {
  up: (queryInterface, Sequelize, { app }) => {
    // Here create your db insert row
  },
  down: (queryInterface, Sequelize) => {
    // Optional, here code your db remove row
  },
};
  `;
  await fs.outputFile(path.resolve(seederDir, curFileName), curFileContent);
};
