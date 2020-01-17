const execa = require('execa');
const path = require('path');
const package = require('../../package.json');

const version = package.version;

console.log('Building TRPG Engine Docker Image:', version, '...');

try {
  execa.sync('docker', ['build', path.resolve(__dirname, '../../')], {
    stdout: process.stdout,
    stderr: process.stderr,
  });

  // TODO
} catch (err) {
  console.log('\n=================\n');
  console.log('Build Failed:\n', err);
}
