import { ChatMessagePartial } from 'packages/Chat/types/message';
import { applyMsgInterceptors } from 'packages/Chat/lib/interceptors';
import { createTestChatlogPayload } from './index';

/**
 * 增加一条消息拦截器的测试用例
 * 需要先buildAppContext
 * @param name 测试名
 * @param input 输入消息体
 * @param output 输出消息体
 */
export function appendInterceptorTest(
  name: string,
  input: ChatMessagePartial,
  output: ChatMessagePartial,
  debug = false
) {
  test(`interceptor: ${name}`, async () => {
    const basicPayload = await createTestChatlogPayload(input);

    const res = await applyMsgInterceptors(basicPayload);

    if (debug) {
      console.log('DEBUG', `[${name}]`, '\n', basicPayload, '=>\n', res);
    }

    expect(res).toMatchObject({ ...basicPayload, ...output });
  });
}
