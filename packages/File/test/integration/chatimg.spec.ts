import { buildAppContext } from 'test/utils/app';

const context = buildAppContext();

describe('chatimg router', () => {
  it.skip('/file/chatimg/upload/info', async () => {
    const { body } = await context.request.get('/file/chatimg/upload/info');

    expect(body).toHaveProperty('result');
    expect(body.result).toBe(true);
    expect(body).toHaveProperty('url');
    expect(body).toHaveProperty('imageField');
    expect(body).toHaveProperty('otherData');
  });
});
