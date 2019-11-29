import { buildAppContext } from 'test/utils/app';

buildAppContext();

test('1 + 2 = 3', () => {
  expect(1 + 2).toBe(3);
});
