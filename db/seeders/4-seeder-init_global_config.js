'use strict';
/**
 * 4-seeder-init_global_config.js
 *
 */

const config = require('./config/global-config');
const _ = require('lodash');

module.exports = {
  up: async (queryInterface, Sequelize, { app }) => {
    // Here create your db insert row
    const db = app.storage.db;
    const keys = _.keys(config);
    for (const key of keys) {
      await db.models.core_global_config.findOrCreate({
        where: {
          name: key,
        },
        defaults: {
          value: config[key],
        },
      });
    }
  },
  down: (queryInterface, Sequelize) => {
    // Optional, here code your db remove row
  },
};
