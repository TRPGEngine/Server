import { generateReportModels } from '../utils';

module.exports = generateReportModels(
  'report_chatlog',
  (Sequelize) => ({
    count: { type: Sequelize.INTEGER, required: true },
    start: { type: Sequelize.DATEONLY, time: false },
    end: { type: Sequelize.DATEONLY, time: false },
  }),
  {}
);
