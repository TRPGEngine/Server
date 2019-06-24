const path = require('path');
const fs = require('fs-extra');
const packages = fs
  .readdirSync(path.resolve(__dirname, '../../../packages/'), {
    withFileTypes: true,
  })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

module.exports = ['lib', 'config', ...packages];
