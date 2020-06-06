import { buildAppContext } from 'test/utils/app';

const context = buildAppContext();

describe('web service', () => {
  test('health check', async () => {
    const { body } = await context.request.get('/core/health');

    expect(body.version).toMatch(/\d*?\.\d*?\.\d*?/);
    expect(typeof body.hash).toBe('string');
    expect(typeof body.env).toBe('string');
    expect(Array.isArray(body.components)).toBe(true);
    expect(body.result).toBe(true);
  });
});
