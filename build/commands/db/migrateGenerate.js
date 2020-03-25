const { getBinPath, exec } = require('../utils');
const _ = require('lodash');

exports.command = 'generate-migrate';
exports.desc = 'generate a db migrate';
exports.builder = function(args) {
  return args
    .usage('$0 generate-migrate --name [name] <options>')
    .string(['name', 'comment'])
    .demandOption('name', 'Require migrate name to generate')
    .default('comment', '').argv;
};
exports.handler = function(argv) {
  const { name, comment } = argv;
  if (!name) {
    // name 不存在
    console.error('Error: Require Migrate Name');
    return;
  }

  exec(getBinPath('makemigration'), [
    '--models-path',
    './db/models.js',
    '--migrations-path',
    './db/migrations',
    '--name',
    _.snakeCase(name), // 强制为蛇形命名
    '--comment',
    comment,
  ]);
};
