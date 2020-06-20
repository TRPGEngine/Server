// 消息内容
type EventMessage =
  | string
  | {
      type: string;
      data: object;
    }[];

// 发送人信息
interface EventSender {
  user_id?: number; // 发送者 QQ 号
  nickname?: string; // 昵称
  sex?: 'male' | 'female' | 'unknown'; // 性别
  age?: number; // 年龄
}

interface EventAnonymous {
  id?: number; // 匿名用户 ID
  name?: string; // 匿名用户名称
  flag?: string; // 匿名用户 flag，在调用禁言 API 时需要传入
}

// 文档地址: https://cqhttp.cc/docs/4.15/#/Post
export type EventType =
  | {
      // 私聊消息
      post_type: 'message';
      message_type: 'private';
      sub_type: 'friend' | 'group' | 'discuss' | 'other';
      message_id: number;
      user_id: number;
      message: EventMessage;
      raw_message: string;
      font: number;
      sender: EventSender;
    }
  | {
      // 群消息
      post_type: 'message';
      message_type: 'group';
      sub_type: 'normal' | 'anonymous' | 'notice';
      message_id: number;
      group_id: number;
      user_id: number;
      anonymous: EventAnonymous;
      message: EventMessage;
      raw_message: string;
      font: number;
      sender: EventSender;
    };
