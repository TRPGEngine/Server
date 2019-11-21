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

test('context should contains socket and emitEvent', () => {
  expect(context).toHaveProperty('socket');
  expect(typeof context.socket).toBe('object');
  expect(context.socket.connected).toBe(true);
  expect(context).toHaveProperty('emitEvent');
  expect(typeof context.emitEvent).toBe('function');
});

test('context.emitEvent should be ok', async () => {
  const ret = await context.emitEvent('hello');
  expect(ret).toMatchObject({
    data: null,
  });
  expect(ret).toHaveProperty('version');
  expect(typeof ret.version).toBe('string');
});
