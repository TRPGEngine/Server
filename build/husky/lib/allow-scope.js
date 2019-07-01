const path = require('path');
const fs = require('fs-extra');
const packagesDir = path.resolve(__dirname, '../../../packages/');

const packages = fs
  .readdirSync(packagesDir)
  .map((p) => path.resolve(packagesDir, p))
  .filter((p) => fs.existsSync(p) && fs.statSync(p).isDirectory())
  .map((p) => path.basename(p));

module.exports = ['lib', 'config', 'doc', 'all', ...packages];
