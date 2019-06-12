const execa = require('execa');
const path = require('path');
const binPath = path.resolve(__dirname, '../../node_modules/.bin/');

exports.getBinPath = function(name) {
  return path.resolve(binPath, name);
};

exports.exec = function exec(file, args, options) {
  return execa(file, args, {
    stdout: process.stdout,
    stderr: process.stderr,
    ...options,
  });
};
