import _ from 'lodash';
import { regMsgInterceptor } from 'packages/Chat/lib/interceptors';
import { roll, rollFate, rollJudge, rollWW } from './utils';
import { DiceLog } from './models/log';
import { PlayerUser } from 'packages/Player/lib/models/user';
import { ChatMessagePartial } from 'packages/Chat/types/message';
import { GroupActor } from 'packages/Group/lib/models/actor';
import { hasString } from 'lib/helper/string-helper';
import { ChatLog } from 'packages/Chat/lib/models/log';

const restPattern = /^[\.。]r(.*)$/; // 用于获取.r后面的内容
const dotRestPattern = /^[\.。](.*)$/; // 用于获取.后面的内容

/**
 * 获取消息的发送者
 * 优先获取消息数据包里的name
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
    if (!hasString(payload.message)) {
      return;
    }

    // .ra 指令
    if (
      payload.message.startsWith('.ra') === true ||
      payload.message.startsWith('。ra') === true
    ) {
      const rest = payload.message.match(restPattern)[1];

      // 仅为群会话时查找会话成员UUID
      const groupUUID = payload.group_uuid ?? payload.converse_uuid;
      const contextData =
        payload.is_group && !_.isNil(groupUUID)
          ? await GroupActor.getGroupActorDataFromConverse(
              groupUUID,
              payload.sender_uuid
            )
          : {};
      const { str, value, targetValue, targetProps, success } = rollJudge(
        rest,
        contextData
      );

      DiceLog.recordDiceLog(rest, str, value, payload);

      const senderName = await getSenderName(payload);
      if (_.isNil(targetValue)) {
        // TODO: 也许需要改为私聊通知?
        payload.message = `${senderName} 输入了错误的表达式或没有找到需要检定的数据: ${rest}`;
      } else {
        payload.message = `${senderName} 进行了${targetProps}检定: ${str}/${targetValue}, ${
          success ? '成功' : '失败'
        }`;
      }
      payload.type = 'tip';
      return;
    }

    // .rf命运骰
    if (
      payload.message.startsWith('.rf') === true ||
      payload.message.startsWith('。rf') === true
    ) {
      const restStr = payload.message.substr(3);

      const { str } = rollFate();

      const senderName = await getSenderName(payload);
      payload.message = `${senderName} ${
        hasString(restStr) ? `因 ${restStr} ` : ''
      }骰出了命运: ${str}`;
      payload.type = 'tip';
      return;
    }

    // .rh 暗骰
    if (
      payload.message.startsWith('.rh') === true ||
      payload.message.startsWith('。rh') === true
    ) {
      const rest = payload.message.match(restPattern)[1];
      const arr = rest.split(' ');
      let diceRequest = arr.shift();
      diceRequest = diceRequest.replace(/h/g, '');
      if (diceRequest === '') {
        // 一个快捷处理，如果输入内容为.r则直接换成.rd
        diceRequest = 'd';
      }
      const restStr = arr.join(' ');

      const senderName = await getSenderName(payload);
      try {
        const { str, value } = roll(diceRequest);
        // 无需同步
        DiceLog.recordDiceLog(diceRequest, str, value, payload);

        payload.message = `${senderName} ${
          hasString(restStr) ? `因 ${restStr} ` : ''
        }投掷了一个暗骰`;
        payload.type = 'tip';

        // 发送私聊
        ChatLog.sendSystemMsg({
          to_uuid: payload.sender_uuid,
          message: `(仅自己可见)暗骰投掷结果 ${str}`,
          converse_uuid: payload.converse_uuid,
          type: 'tip',
          data: {},
          is_public: false,
          date: new Date(new Date().valueOf() + 100).toISOString(), // 确保投骰的消息时间在提示之后
        });

        return;
      } catch (e) {
        payload.message = `${senderName} 尝试进行投骰[${diceRequest}]失败: ${String(
          e.message ?? e
        )}`;
        payload.type = 'tip';
        return;
      }
    }

    // .r指令
    if (
      payload.message.startsWith('.r') === true ||
      payload.message.startsWith('。r') === true
    ) {
      const rest = payload.message.match(restPattern)[1];
      const arr = rest.split(' ');
      let diceRequest = arr.shift();
      if (diceRequest === '') {
        // 一个快捷处理，如果输入内容为.r则直接换成.rd
        diceRequest = 'd';
      }
      const restStr = arr.join(' ');

      const senderName = await getSenderName(payload);
      try {
        const { str, value } = roll(diceRequest);
        // 无需同步
        DiceLog.recordDiceLog(diceRequest, str, value, payload);

        payload.message = `${senderName} ${
          hasString(restStr) ? `因 ${restStr} ` : ''
        }骰出了: ${str}`;
        payload.type = 'tip';
        return;
      } catch (e) {
        payload.message = `${senderName} 尝试进行投骰[${diceRequest}]失败: ${String(
          e.message ?? e
        )}`;
        payload.type = 'tip';
        return;
      }
    }

    // .ww指令
    if (
      payload.message.startsWith('.ww') === true ||
      payload.message.startsWith('。ww') === true
    ) {
      const diceRequest = payload.message.match(dotRestPattern)[1];
      const senderName = await getSenderName(payload);
      try {
        const { str, value } = rollWW(diceRequest);

        DiceLog.recordDiceLog(diceRequest, str, value, payload);

        payload.message = `${senderName} 骰出了: ${diceRequest}=${str}`;
        payload.type = 'tip';
      } catch (e) {
        payload.message = `${senderName} 尝试进行投骰[${diceRequest}]失败: ${String(
          e.message ?? e
        )}`;
        payload.type = 'tip';
      } finally {
        return;
      }
    }
  });
});
