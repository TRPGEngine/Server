#!/usr/bin/env node
const execa = require('execa');
const package = require('./package.json');
const path = require('path');
const binPath = path.resolve(__dirname, './node_modules/.bin/');
const getBinPath = (name) => {
  return path.resolve(binPath, name);
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

      execa(
        getBinPath('makemigration'),
        [
          '--models-path',
          './db/models.js',
          '--migrations-path',
          './db/migrations',
          '--name',
          name,
          '--comment',
          comment,
        ],
        {
          stdout: process.stdout,
          stderr: process.stderr,
        }
      );
    }
  )
  .help('help')
  .alias('help', 'h')
  .version('version', package.version)
  .alias('version', 'v').argv;
