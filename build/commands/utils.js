const execa = require('execa');
const path = require('path');
const rootPath = path.resolve(__dirname, '../../');
const binPath = path.resolve(__dirname, '../../node_modules/.bin/');

exports.getVersion = function () {
  return require('../../package.json').version;
};

exports.getBinPath = function (name) {
  return path.resolve(binPath, name);
};

exports.getProjectPath = function (name) {
  return path.resolve(rootPath, name);
};

exports.exec = function exec(file, args, options) {
  return execa(file, args, {
    stdout: process.stdout,
    stderr: process.stderr,
    ...options,
  });
};
