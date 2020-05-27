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
  output: ChatMessagePartial
) {
  test(`interceptor: ${name}`, () => {
    expect(applyMsgInterceptors(createTestChatlogPayload(input))).toMatchObject(
      createTestChatlogPayload(output)
    );
  });
}
