import { buildAppContext } from 'test/utils/app';

const context = buildAppContext();

describe('socket service', () => {
  test('health check', async () => {
    const ret = await context.emitEvent('core::health', { test: 1 });

    expect(ret).toHaveProperty('data', { test: 1 });
    expect(ret).toHaveProperty('version');
  });
});
