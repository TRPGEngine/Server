exports.generateReportModels = function generateReportModels(name, struct, options) {
  return {
    daily(Sequelize, db) {
      return db.define(name + '_daily', struct(Sequelize), options);
    },
    weekly(Sequelize, db) {
      return db.define(name + '_weekly', struct(Sequelize), options);
    },
    monthly(Sequelize, db) {
      return db.define(name + '_monthly', struct(Sequelize), options);
    }
  }
}
