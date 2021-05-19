import { getStrAfterFirstBlank, groupString } from '../string-helper';

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

describe('groupString', () => {
  test.each([
    ['word', 1, ['w', 'o', 'r', 'd']],
    ['word', 2, ['wo', 'rd']],
    ['word', 3, ['wor', 'd']],
    ['word', 4, ['word']],
    ['word', 5, ['word']],
  ])('%s, %d => %s', (str: string, step: number, output: string[]) => {
    expect(groupString(str, step)).toMatchObject(output);
  });
});
