import _ from 'lodash';
import { rollJudge, rollWW } from '../lib/utils';

describe('roll express parse', () => {
  describe('rollJudge', () => {
    test.each([
      ['a', {}, 50],
      ['a 80', {}, 80],
      ['a 力量', { 力量: 80 }, 80],
      ['a 力量 30', { 力量: 80 }, 30],
      ['ah 80', {}, 80, true],
    ])(
      '%s',
      (exp: string, context: {}, target: number, isHidden: boolean = false) => {
        for (let i = 0; i < 10; i++) {
          // 每个testcase循环10次
          const res = rollJudge(exp, context);
          expect(typeof res.str).toBe('string');
          expect(typeof res.value).toBe('number');
          expect(res.isHidden).toBe(isHidden);
          expect(res.success).toBe(res.value < target);
        }
      }
    );
  });

  describe('rollWW', () => {
    test.each([
      [10, null],
      [10, 8],
      [10, 6],
    ])('ww%da%d', (rollNum, validPoint) => {
      for (let i = 0; i < 10; i++) {
        // 每个testcase循环10次
        const res = rollWW(
          _.isNil(validPoint) ? `ww${rollNum}` : `ww${rollNum}a${validPoint}`
        );
        expect(typeof res.str).toBe('string');
        expect(typeof res.value).toBe('number');

        // 将数据拆分成数组
        const resList = res.str.split('+').map((s) =>
          s
            .slice(1, -1)
            .split(',')
            .map(Number)
        );
        expect(res.value).toBe(_.flatten(resList).filter((x) => x >= 8).length); // 计算有效值
        resList.forEach((val, i, arr) => {
          if (i >= 1) {
            // 从第二个组开始校验
            expect(val.length).toBe(
              arr[i - 1].filter((x) => x >= (validPoint ?? 10)).length
            );
          }
        });
      }
    });
  });
});
