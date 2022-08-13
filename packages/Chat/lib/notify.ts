import { ChatMessagePayload } from '../types/message';
import { getGlobalApplication } from 'lib/application';
import _ from 'lodash';

/**
 * 通知更新消息
 * @param uuid 消息UUID
 * @param payload 更新消息的完整消息体
 */
export async function notifyUpdateMessage(
  uuid: string,
  payload: ChatMessagePayload
) {
  const app = getGlobalApplication();

  const notifyPayload = {
    ...payload,
    uuid,
  };

  if (!_.isEmpty(notifyPayload.to_uuid)) {
    // 该消息是发送给个人的
    await Promise.all([
      app.player.manager.unicastSocketEvent(
        notifyPayload.to_uuid,
        'chat::updateMessage',
        {
          converseUUID: notifyPayload.sender_uuid,
          payload: notifyPayload,
        }
      ),
      app.player.manager.unicastSocketEvent(
        notifyPayload.sender_uuid,
        'chat::updateMessage',
        {
          converseUUID: notifyPayload.to_uuid,
          payload: notifyPayload,
        }
      ),
    ]);
  } else if (!_.isEmpty(notifyPayload.group_uuid)) {
    // 该消息为团消息
    await app.player.manager.roomcastSocketEvent(
      notifyPayload.group_uuid,
      'chat::updateMessage',
      {
        converseUUID: notifyPayload.converse_uuid,
        payload: notifyPayload,
      }
    );
  } else if (!_.isEmpty(notifyPayload.converse_uuid)) {
    // 该消息为多人会话消息
    await app.player.manager.roomcastSocketEvent(
      notifyPayload.converse_uuid,
      'chat::updateMessage',
      {
        converseUUID: notifyPayload.converse_uuid,
        payload: notifyPayload,
      }
    );
  }
}
