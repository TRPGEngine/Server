import moment from 'moment';
import { buildAppContext } from 'test/utils/app';
import { CoreMetrics } from '../lib/internal/models/metrics';
const context = buildAppContext();

describe('internal module', () => {
  test('getGlobalConfig should be ok', async () => {
    const ret = await context.emitEvent('core::getGlobalConfig');
    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('config');
    expect(Array.isArray(ret.config)).toBe(true);
  });

  describe('model - CoreMetrics', () => {
    test('getStatisInfo should be ok', async () => {
      const startDate = moment()
        .subtract(7, 'day')
        .format('YYYY-MM-DD');
      const endDate = moment().format('YYYY-MM-DD');
      const statis = await CoreMetrics.getStatisInfo(startDate, endDate);

      expect(statis.startDate).toBe(startDate);
      expect(statis.endDate).toBe(endDate);
      expect(statis).toHaveProperty('info');
      expect(typeof statis.info).toBe('object');
    });
  });
});
