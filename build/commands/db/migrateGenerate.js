const { getBinPath, exec } = require('../utils');

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
  const { name, comment } = args;
  if (!name) {
    // name为字符串且
    console.error('Error: Require Migrate Name');
    return;
  }

  exec(getBinPath('makemigration'), [
    '--models-path',
    './db/models.js',
    '--migrations-path',
    './db/migrations',
    '--name',
    name,
    '--comment',
    comment,
  ]);
};
