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
    'roll dice shortcuts',
    {
      message: '.r',
    },
    {
      message: expect.stringContaining('骰出了: d'),
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
    }
  );

  // TODO: test ra

  // 命运骰
  appendInterceptorTest(
    'roll rf',
    {
      message: '.rf',
    },
    {
      message: expect.stringContaining('骰出了命运:'),
      type: 'tip',
    }
  );
  appendInterceptorTest(
    'roll rf with reason',
    {
      message: '.rf1',
    },
    {
      message: expect.stringContaining('因 1 骰出了命运:'),
      type: 'tip',
    }
  );
});
