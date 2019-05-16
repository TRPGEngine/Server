const trpgapp = global.trpgapp;

describe('application', () => {
  test('application ioserver should be ok', () => {
    expect(!!trpgapp).toBe(true);
  });
});
