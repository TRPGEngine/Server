import { ChatMessagePartial } from '../types/message';
import _ from 'lodash';
import { getGlobalApplication } from 'lib/application';
import { getStrAfterFirstBlank } from 'lib/helper/string-helper';
import { isNormalMessageType } from './utils';

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

/**
 * 注册消息拦截器用于使用指令切换消息类型
 */
export const initInterceptors = _.once(() => {
  regMsgInterceptor(async (ctx) => {
    const payload = ctx.payload;
    if (!_.isString(payload.message)) {
      return;
    }

    if (isNormalMessageType(payload.type)) {
      // 如果用户发送的消息是普通的消息类型
      if (
        payload.message.startsWith('/act ') === true ||
        payload.message.startsWith('/a ') === true
      ) {
        payload.message = getStrAfterFirstBlank(payload.message);
        payload.type = 'action';
      } else if (
        payload.message.startsWith('/speak ') === true ||
        payload.message.startsWith('/s ') === true
      ) {
        payload.message = getStrAfterFirstBlank(payload.message);
        payload.type = 'speak';
      } else if (payload.message.startsWith('/ooc ') === true) {
        payload.message = getStrAfterFirstBlank(payload.message);
        payload.type = 'ooc';
      }
    }
  });
});
