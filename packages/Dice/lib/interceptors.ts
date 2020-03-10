import _ from 'lodash';
import { regMsgInterceptor } from 'packages/Chat/lib/interceptors';
import { roll, rollJudge } from './utils';
import { DiceLog } from './models/log';
import { PlayerUser } from 'packages/Player/lib/models/user';
import { ChatMessagePartial } from 'packages/Chat/types/message';

// r指令
const restPattern = /^\.r(.*)$/; // 用于获取.r后面的内容

/**
 * 获取消息的发送者
 */
async function getSenderName(payload: ChatMessagePartial) {
  let senderName = '';
  if (_.isString(_.get(payload, ['data', 'name']))) {
    senderName = _.get(payload, ['data', 'name']);
  } else {
    const user = await PlayerUser.findByUUID(payload.sender_uuid);
    senderName = user.getName();
  }

  return senderName;
}

/**
 * 注册消息拦截器用于处理指令式消息
 * roll点相关
 */
export const initInterceptors = _.once(() => {
  regMsgInterceptor(async (ctx) => {
    const payload = ctx.payload;
    if (!_.isString(payload.message)) {
      return;
    }

    // .ra 指令
    if (payload.message.startsWith('.ra') === true) {
      const rest = payload.message.match(restPattern)[1];
      const { str, value, target, success } = rollJudge(rest, {}); // TODO 先没有参数

      DiceLog.recordDiceLog(rest, str, value, payload);

      const senderName = await getSenderName(payload);
      payload.message = `${senderName} 骰出了判定骰(目标${target}): ${str}, ${
        success ? '判定成功' : '判定失败'
      }`;
      payload.type = 'tip';
      return;
    }

    // .r指令
    if (payload.message.startsWith('.r') === true) {
      const rest = payload.message.match(restPattern)[1];
      const arr = rest.split(' ');
      const diceRequest = arr.shift();
      const restStr = arr.join(' ');

      const { str, value } = roll(diceRequest);

      // 无需同步
      DiceLog.recordDiceLog(diceRequest, str, value, payload);

      const senderName = await getSenderName(payload);
      payload.message = `${senderName} ${
        _.isString(restStr) ? `因${restStr} ` : ''
      }骰出了: ${str}`;
      payload.type = 'tip';

      return;
    }
  });
});
