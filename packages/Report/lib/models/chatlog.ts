import { Model } from 'trpg/core';
import { generateReportPackageModels } from '../utils';

export class ReportChatLogDaily extends Model {}

export class ReportChatLogWeekly extends Model {}

export class ReportChatLogMonthly extends Model {}

const ReportChatlogAllDefinition = generateReportPackageModels(
  'report_chatlog',
  {
    daily: ReportChatLogDaily,
    weekly: ReportChatLogWeekly,
    monthly: ReportChatLogMonthly,
  },
  (Sequelize) => ({
    count: { type: Sequelize.INTEGER, required: true },
    start: { type: Sequelize.DATEONLY, time: false },
    end: { type: Sequelize.DATEONLY, time: false },
  })
);

export default ReportChatlogAllDefinition;
