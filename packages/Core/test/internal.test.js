const trpgapp = global.trpgapp;
const emitEvent = global.emitEvent;

describe('internal module', () => {
  test('getGlobalConfig should be ok', async () => {
    const ret = await emitEvent('core::getGlobalConfig');
    expect(ret.result).toBe(true);
    expect(ret).toHaveProperty('config');
    expect(Array.isArray(ret.config)).toBe(true);
  });
});
