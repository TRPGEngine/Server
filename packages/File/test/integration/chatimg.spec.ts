import request from 'test/utils/request';

describe('chatimg router', () => {
  it('/file/chatimg/upload/info', async () => {
    const { data } = await request.get('/file/chatimg/upload/info');

    expect(data).toHaveProperty('result');
    expect(data.result).toBe(true);
    expect(data).toHaveProperty('url');
    expect(data).toHaveProperty('imageField');
    expect(data).toHaveProperty('otherData');
  });
});
