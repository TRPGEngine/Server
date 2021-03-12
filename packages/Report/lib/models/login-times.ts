import { generateReportModels } from '../utils';

module.exports = generateReportModels(
  'report_login_times',
  (Sequelize) => ({
    login_count: { type: Sequelize.INTEGER, required: true },
    user_count: { type: Sequelize.INTEGER, required: true },
    start: { type: Sequelize.DATEONLY },
    end: { type: Sequelize.DATEONLY },
  }),
  {}
);
