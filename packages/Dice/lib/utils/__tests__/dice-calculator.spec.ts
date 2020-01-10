import { standardDiceRE, infix2Suffix } from '../dice-calculator';

describe('dice calculator', () => {
  describe('standard dice expression', () => {
    test.each([
      ['1d100', true],
      ['d100', true],
      ['1d', true],
      ['b', true],
      ['p', true],
      ['b1', true],
      ['p3', true],
    ])('expression: %s', (expression: string, should: boolean) => {
      expect(standardDiceRE.test(expression)).toBe(should);
    });
  });

  describe.only('infix2Suffix', () => {
    // 中缀表达式转后缀表达式
    test.each([
      ['1+1', ['1', '1', '+']],
      ['1+2*3', ['1', '2', '3', '*', '+']],
      ['1*2+3', ['1', '2', '*', '3', '+']],
      ['1*2*4+3', ['1', '2', '*', '4', '*', '3', '+']],
      ['1+2*(3+1)', ['1', '2', '3', '1', '+', '*', '+']],
    ])('%s => %s', (exp: string, res: string[]) => {
      expect(infix2Suffix(exp)).toStrictEqual(res);
    });
  });

  describe('simple calculator', () => {
    test.each([
      ['1+1', 2],
      ['1+2', 3],
      ['1*2', 2],
      ['1/2', 0.5],
      ['10-5', 5],
      ['1+2*(2+1)', 7],
    ])('%s = %d', (expression, result) => {
      expect(expression).toBe(result);
    });
  });
});
