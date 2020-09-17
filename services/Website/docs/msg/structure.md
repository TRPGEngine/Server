---
id: structure
title: 消息结构
---

消息体结构:

```typescript
{
  uuid: string; // UUID
  message: string; // 消息内容
  sender_uuid: string; // 发送者UUID
  to_uuid: string | null; // 目标UUID
  converse_uuid: string; // 会话UUID
  group_uuid?: string; // 团UUID, 用于在频道发言标识当前频道所在的团的UUID
  type: ChatMessageType; // 消息类型
  is_public: boolean; // 是否为公开消息
  is_group: boolean; // 是否为团信息
  date: string; // 发送时间
  data: object; // 额外数据
  revoke?: boolean; // 是否撤回
}
```

-----------------

消息额外信息:

```typescript
{
  name?: string; // 覆盖显示消息发送者名
  avatar?: string; // 覆盖显示消息发送者头像地址
  groupActorUUID?: string; // 相关团角色UUID
  
  // 回复消息相关
  replyMsg?: {
    uuid: string;
    message: string;
    sender_uuid: string;
  };
  
  // 机器人相关
  bot?: {
    uuid: string; // 机器人UUID
  };
}
```
