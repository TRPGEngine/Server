#!/usr/bin/env node
const execa = require('execa');
const package = require('./package.json');
const path = require('path');
const binPath = path.resolve(__dirname, './node_modules/.bin/');
const getBinPath = (name) => {
  return path.resolve(binPath, name);
};
const exec = (file, args, options) => {
  return execa(file, args, {
    stdout: process.stdout,
    stderr: process.stderr,
    ...options,
  });
};

const yargs = require('yargs');
yargs
  .command(
    'generate-migrate',
    'generate a db migrate',
    function builder(args) {
      return args
        .usage('$0 generate-migrate --name [name] <options>')
        .string(['name', 'comment'])
        .demandOption('name', 'Require migrate name to generate')
        .default('comment', '').argv;
    },
    function handler(args) {
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
    }
  )
  .command('run-migrate', 'run all db migrate', {}, function handler(args) {
    exec(
      getBinPath('runmigration'),
      [
        '--models-path',
        './db/models.js',
        '--migrations-path',
        './db/migrations',
      ],
      {
        env: {
          TRPG_PORT: 23666, // 使用一个不冲突的端口
        },
      }
    );
  })
  // 代码补全
  .completion('completion', function(current, argv) {
    // 'current' is the current command being completed.
    // 'argv' is the parsed arguments so far.
    // simply return an array of completions.
    return ['generate-migrate', 'run-migrate'];
  })
  .help('help')
  .alias('help', 'h')
  .version('version', package.version)
  .alias('version', 'v').argv;
