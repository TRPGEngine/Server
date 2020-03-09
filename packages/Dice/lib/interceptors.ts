import _ from 'lodash';
import { regMsgInterceptor } from 'packages/Chat/lib/interceptors';
import { roll } from './utils';
import { DiceLog } from './models/log';
import { PlayerUser } from 'packages/Player/lib/models/user';

/**
 * 注册消息拦截器用于处理指令式消息
 */
export const initInterceptors = _.once(() => {
  // .r指令
  const restPattern = /^\.r(.*)$/; // 用于获取.r后面的内容
  regMsgInterceptor(async (ctx) => {
    const payload = ctx.payload;
    if (
      _.isString(payload.message) &&
      payload.message.startsWith('.r') === true
    ) {
      const rest = payload.message.match(restPattern)[1];
      const arr = rest.split(' ');
      const diceRequest = arr.shift();
      const restStr = arr.join(' ');

      const { str, value } = roll(diceRequest);

      // 无需同步
      const {
        sender_uuid,
        converse_uuid,
        to_uuid,
        is_group,
        is_public,
      } = payload;
      DiceLog.create({
        sender_uuid,
        to_uuid: is_group ? converse_uuid : to_uuid,
        is_group,
        is_private: !is_public,
        dice_request: diceRequest,
        dice_expression: str,
        dice_result: value,
      });

      let senderName = '';
      if (_.isString(_.get(payload, ['data', 'name']))) {
        senderName = _.get(payload, ['data', 'name']);
      } else {
        const user = await PlayerUser.findByUUID(sender_uuid);
        senderName = user.getName();
      }
      payload.message = `${senderName} ${
        _.isString(restStr) ? `因${restStr} ` : ''
      }骰出了: ${str}`;
      payload.type = 'tip';
    }
  });
});
