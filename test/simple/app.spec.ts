import { buildAppContext } from 'test/utils/app';
import Application from 'packages/Core/lib/application';
import { sleep } from 'lib/helper/utils';

const context = buildAppContext();

describe('app context', () => {
  test('context should contains app', () => {
    expect(context).toHaveProperty('app');
    expect(typeof context.app).toBe('object');
    expect(context.app instanceof Application).toBe(true);
  });

  test('context should contains port', () => {
    expect(context).toHaveProperty('port');
    expect(typeof context.port).toBe('number');
  });

  test('context should contains socket and emitEvent', async () => {
    expect(context).toHaveProperty('socket');
    expect(typeof context.socket).toBe('object');
    expect(context).toHaveProperty('emitEvent');
    expect(typeof context.emitEvent).toBe('function');

    await sleep(500); // 延时一段时间后检测是否连接上
    expect(context.socket.connected).toBe(true);
  });

  test('context.emitEvent should be ok', async () => {
    const ret = await context.emitEvent('hello');
    expect(ret).toMatchObject({
      data: null,
    });
    expect(ret).toHaveProperty('version');
    expect(typeof ret.version).toBe('string');
  });

  test('context should contains request', () => {
    expect(context).toHaveProperty('request');
    expect(typeof context.request).toBe('object');
    expect(context.request).toHaveProperty('get');
    expect(context.request).toHaveProperty('post');
  });

  test('context.request should be ok', async () => {
    const { status, body } = await context.request.get('/core/health');
    expect(status).toBe(200);
    expect(body).toMatchObject({
      result: true,
    });
    expect(body).toHaveProperty('version');
    expect(typeof body.version).toBe('string');
    expect(body).toHaveProperty('hash');
    expect(typeof body.hash).toBe('string');
    expect(body).toHaveProperty('env');
    expect(typeof body.env).toBe('string');
  });
});
