import { buildAppContext } from 'test/utils/app';
import Application from 'packages/Core/lib/application';

const context = buildAppContext();

test('context should contains app', () => {
  expect(context).toHaveProperty('app');
  expect(typeof context.app).toBe('object');
  expect(context.app instanceof Application).toBe(true);
});

test('context should contains port', () => {
  expect(context).toHaveProperty('port');
  expect(typeof context.port).toBe('number');
});
