import moment, { MomentInput } from 'moment';

/**
 * 返回一个YYYY-MM-DD的标准日期
 * @param date 日期
 */
export function getDate(date: MomentInput): string {
  return moment(date).format('YYYY-MM-DD');
}
