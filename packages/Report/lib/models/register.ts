import { Model } from 'trpg/core';
import { generateReportPackageModels } from '../utils';

export class ReportRegisterDaily extends Model {}

export class ReportRegisterWeekly extends Model {}

export class ReportRegisterMonthly extends Model {}

const ReportRegisterAllDefinition = generateReportPackageModels(
  'report_register',
  {
    daily: ReportRegisterDaily,
    weekly: ReportRegisterWeekly,
    monthly: ReportRegisterMonthly,
  },
  (Sequelize) => ({
    count: { type: Sequelize.INTEGER, required: true },
    start: { type: Sequelize.DATEONLY },
    end: { type: Sequelize.DATEONLY },
  })
);

export default ReportRegisterAllDefinition;
