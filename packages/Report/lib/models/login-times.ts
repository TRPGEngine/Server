import { Model } from 'trpg/core';
import { generateReportPackageModels } from '../utils';

export class ReportLoginTimesDaily extends Model {}

export class ReportLoginTimesWeekly extends Model {}

export class ReportLoginTimesMonthly extends Model {}

const ReportLoginTimesAllDefinition = generateReportPackageModels(
  'report_login_times',
  {
    daily: ReportLoginTimesDaily,
    weekly: ReportLoginTimesWeekly,
    monthly: ReportLoginTimesMonthly,
  },
  (Sequelize) => ({
    login_count: { type: Sequelize.INTEGER, required: true },
    user_count: { type: Sequelize.INTEGER, required: true },
    start: { type: Sequelize.DATEONLY },
    end: { type: Sequelize.DATEONLY },
  })
);

export default ReportLoginTimesAllDefinition;
