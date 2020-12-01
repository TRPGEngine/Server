import _ from 'lodash';
import moment from 'moment';
import { buildAppContext } from 'test/utils/app';
import { regAutoClear } from 'test/utils/example';
import { CoreMetrics } from '../lib/internal/models/metrics';
import { CoreStats } from '../lib/internal/models/stats';

const context = buildAppContext();
regAutoClear();

describe('internal module', () => {
  test('getGlobalConfig should be ok', async () => {
    const ret = await context.emitEvent('core::getGlobalConfig');
    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('config');
    expect(Array.isArray(ret.config)).toBe(true);
  });

  describe('model - CoreMetrics', () => {
    test('getStatisInfo should be ok', async () => {
      const startDate = moment().subtract(7, 'day').format('YYYY-MM-DD');
      const endDate = moment().format('YYYY-MM-DD');
      const statis = await CoreMetrics.getStatisInfo(startDate, endDate);

      expect(statis.startDate).toBe(startDate);
      expect(statis.endDate).toBe(endDate);
      expect(statis).toHaveProperty('info');
      expect(typeof statis.info).toBe('object');
    });
  });

  describe('model - CoreStats', () => {
    test('setStats should be ok', async () => {
      try {
        await CoreStats.setStats({
          string: '中文',
          number: 123,
        });

        const all: CoreStats[] = await CoreStats.findAll();
        expect(
          _.orderBy(
            all.map((x) => x.toJSON()),
            'key'
          )
        ).toMatchObject([
          {
            key: 'number',
            value: 123,
          },
          {
            key: 'string',
            value: '中文',
          },
        ]);
      } finally {
        await CoreStats.destroy({
          truncate: true,
        });
      }
    });

    test('getAllStats should be ok', async () => {
      try {
        await CoreStats.create({
          key: 'test',
          value: 'test',
        });

        const map = await CoreStats.getAllStats();

        expect(map).toMatchObject({
          test: 'test',
        });
      } finally {
        await CoreStats.destroy({
          truncate: true,
        });
      }
    });
  });
});
