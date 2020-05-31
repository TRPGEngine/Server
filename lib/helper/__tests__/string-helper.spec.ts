import { getStrAfterFirstBlank } from '../string-helper';

describe('getStrAfterFirstBlank', () => {
  test.each([
    ['word', 'word'],
    ['word word2', 'word2'],
    [1, ''],
    [undefined, ''],
    [null, ''],
  ])('%s => %s', (input: string, output: string) => {
    expect(getStrAfterFirstBlank(input)).toBe(output);
  });
});
