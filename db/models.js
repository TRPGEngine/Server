if(process.env.NODE_ENV !== 'ci') {
  // 仅非ci环境生效
  process.env.NODE_ENV = 'migration';
}
const app = require('../standard');

const db = {
  sequelize: app.storage.db,
  Sequelize: app.storage._Sequelize,
  app,
};

for (const model of app.storage.models) {
  const modelName = model.name;
  console.log('Loading db model:', modelName);
  db[modelName] = model;
}

module.exports = db;
