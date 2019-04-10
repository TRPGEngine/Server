const app = require('../standard');

const db = {
  sequelize: app.storage.db,
  Sequelize: app.storage._Sequelize,
};

for (const model of app.storage.models) {
  const modelName = model.name;
  console.log('Loading db model:', modelName);
  db[modelName] = model;
}

module.exports = db;
