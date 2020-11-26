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
    'roll dice shortcuts with string',
    {
      message: '.r 测试',
    },
    {
      message: expect.stringContaining('因 测试 骰出了: d'),
      type: 'tip',
    }
  );

  appendInterceptorTest(
    'roll dice oversize',
    {
      message: '.r999d99999',
    },
    {
      message: expect.stringContaining(
        '尝试进行投骰[999d99999]失败: 投骰点数超限, 最大为100d1000'
      ),
      type: 'tip',
    }
  );

  appendInterceptorTest(
    'roll dice error string',
    {
      message: '.r测试',
    },
    {
      message: expect.stringContaining(
        '尝试进行投骰[测试]失败: 非法的投骰表达式: 测试'
      ),
      type: 'tip',
    }
  );

  appendInterceptorTest(
    'roll ww',
    {
      message: '.ww',
    },
    {
      message: expect.stringContaining(
        '尝试进行投骰[ww]失败: 不合法的表达式:ww, 请输入骰数如.ww5'
      ),
      type: 'tip',
    }
  );

  appendInterceptorTest(
    'roll ww7',
    {
      message: '.ww7',
    },
    {
      message: expect.stringContaining('骰出了'),
      type: 'tip',
    }
  );

  // TODO: test .ra

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

  // 暗骰
  appendInterceptorTest(
    'roll rh',
    {
      message: '.rh',
    },
    {
      message: expect.stringContaining('投掷了一个暗骰'),
      type: 'tip',
    }
  );
});
