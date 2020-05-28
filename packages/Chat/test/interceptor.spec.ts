import { buildAppContext } from 'test/utils/app';
import { appendInterceptorTest } from './example/appendInterceptorTest';

/**
 * 消息拦截器测试
 */

const context = buildAppContext();

describe('interceptors', () => {
  appendInterceptorTest('nothing', {}, {});
  appendInterceptorTest(
    'start with /a',
    {
      message: '/a msg',
      type: 'normal',
    },
    {
      message: 'msg',
      type: 'action',
    }
  );
  appendInterceptorTest(
    'start with /act',
    {
      message: '/act msg',
      type: 'normal',
    },
    {
      message: 'msg',
      type: 'action',
    }
  );
  appendInterceptorTest(
    'start with /speak',
    {
      message: '/speak msg',
      type: 'normal',
    },
    {
      message: 'msg',
      type: 'speak',
    }
  );
  appendInterceptorTest(
    'start with /s',
    {
      message: '/s msg',
      type: 'normal',
    },
    {
      message: 'msg',
      type: 'speak',
    }
  );
  appendInterceptorTest(
    'start with /ooc',
    {
      message: '/ooc msg',
      type: 'normal',
    },
    {
      message: 'msg',
      type: 'ooc',
    }
  );
});
