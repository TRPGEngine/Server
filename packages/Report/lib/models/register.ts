import { generateReportModels } from '../utils';

module.exports = generateReportModels(
  'report_register',
  (Sequelize) => ({
    count: { type: Sequelize.INTEGER, required: true },
    start: { type: Sequelize.DATEONLY },
    end: { type: Sequelize.DATEONLY },
  }),
  {}
);
