const utils = require('../utils');

module.exports = utils.generateReportModels('report_register', (Sequelize) => ({
  count: {type: Sequelize.INTEGER, required: true},
  start: {type: Sequelize.DATEONLY},
  end: {type: Sequelize.DATEONLY},
}), {

})
