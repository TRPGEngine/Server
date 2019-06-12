const { getBinPath, exec } = require('../utils');

exports.command = 'run-migrate';
exports.desc = 'run all db migrate';
exports.builder = {};
exports.handler = function(argv) {
  exec(
    getBinPath('runmigration'),
    ['--models-path', './db/models.js', '--migrations-path', './db/migrations'],
    {
      env: {
        TRPG_PORT: 23666, // 使用一个不冲突的端口
      },
    }
  );
};
