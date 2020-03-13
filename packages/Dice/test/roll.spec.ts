import { rollJudge } from '../lib/utils';

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
          // 每个testcase循环10此
          const res = rollJudge(exp, context);
          expect(typeof res.str).toBe('string');
          expect(typeof res.value).toBe('number');
          expect(res.isHidden).toBe(isHidden);
          expect(res.success).toBe(res.value < target);
        }
      }
    );
  });
});
