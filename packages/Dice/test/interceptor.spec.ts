import { buildAppContext } from 'test/utils/app';
import { appendInterceptorTest } from 'packages/Chat/test/example/appendInterceptorTest';

/**
 * 消息拦截器测试
 */

const context = buildAppContext();

describe('interceptors', () => {
  appendInterceptorTest(
    'roll dice',
    {
      message: '.r1d100',
    },
    {
      message: expect.stringContaining('骰出了: 1d100'),
      type: 'tip',
    }
  );

  appendInterceptorTest(
    'roll ww',
    {
      message: '.ww7',
    },
    {
      message: expect.stringContaining('骰出了'),
      type: 'tip',
    },
    true
  );

  // TODO: test ra
});
