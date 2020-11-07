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
  .commandDir('build/commands')
  // 代码补全
  .completion('completion', function(current, argv) {
    // 'current' is the current command being completed.
    // 'argv' is the parsed arguments so far.
    // simply return an array of completions.
    return ['generate-migrate', 'run-migrate'];
  })
  .demandCommand()
  .help('help')
  .alias('help', 'h')
  .version('version', package.version)
  .alias('version', 'v').argv;
