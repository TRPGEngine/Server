const path = require('path');
const glob = require('glob');
const { getProjectPath } = require('../utils');

const pattern = '*[0-9]-seeder-*.js';
const seederDir = getProjectPath('./db/seeders/');

exports.command = 'run-seeder';
exports.desc = 'run all db seeder or specify seeder file';
exports.builder = function(args) {
  return args
    .usage('$0 run-seed [--file anyseed.js]')
    .alias('f', 'file')
    .describe('file', 'Optional, specify seed file').argv;
};
exports.handler = async function(argv) {
  const { file } = argv;

  const { sequelize, Sequelize } = require('../../../db/models');
  const queryInterface = sequelize.getQueryInterface();

  const execSeederFile = async (file) => {
    console.log('Seeders to execute: ' + file);
    const targetFile = path.resolve(seederDir, file);
    const module = require(targetFile);

    if (module['up'] && typeof module['up'] === 'function') {
      await module['up'](queryInterface, Sequelize);
    } else {
      console.log('Exec fail, should have up function in', filename);
    }
  };

  if (file) {
    // Handle Specify Seed
    await execSeederFile(file);
  } else {
    // Handle All Seed
    const seederFiles = glob(pattern, {
      cwd: seederDir,
      sync: true,
    });
    const alreadyExecuted = await sequelize
      .query('SELECT * FROM `SequelizeMeta`', {
        type: sequelize.QueryTypes.SELECT,
      })
      .then((scripts) => (scripts || []).map((x) => x.name));

    for (const sf of seederFiles) {
      if (!alreadyExecuted.includes(sf)) {
        await execSeederFile(sf);

        // 执行完毕后记录插入数据库
        await queryInterface.bulkInsert('SequelizeMeta', [
          {
            name: sf,
          },
        ]);
      }
    }
  }

  console.log('completed!');
  process.exit(0);
};
