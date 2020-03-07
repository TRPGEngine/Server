import { ChatMessagePartial } from '../types/message';
import _ from 'lodash';
import { getGlobalApplication } from 'lib/application';

interface InterceptorContext {
  payload: ChatMessagePartial;
}

type InterceptorFn = (ctx: InterceptorContext) => void;

const msgInterceptorList = [];

/**
 * 注册消息拦截器
 */
export function regMsgInterceptor(interceptor: InterceptorFn) {
  msgInterceptorList.push(interceptor);
}

/**
 * 应用消息拦截器
 */
export async function applyMsgInterceptors<T = ChatMessagePartial>(
  messagePayload: T
): Promise<T> {
  const context = { payload: { ...messagePayload } };
  for (const interceptor of msgInterceptorList) {
    try {
      _.isFunction(interceptor) && (await interceptor(context));
    } catch (e) {
      getGlobalApplication().error(e);
    }
  }

  return context.payload;
}
