import { buildAppContext } from 'test/utils/app';
import { appendInterceptorTest } from './example/appendInterceptorTest';

/**
 * 消息拦截器测试
 */

const context = buildAppContext();

describe('interceptors', () => {
  appendInterceptorTest('nothing', {}, {});
});
