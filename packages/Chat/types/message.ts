export type ChatMessageType =
  | 'normal'
  | 'system'
  | 'ooc'
  | 'speak'
  | 'action'
  | 'cmd'
  | 'card'
  | 'tip'
  | 'file';

export interface ChatMessagePayload {
  uuid: string;
  message: string;
  sender_uuid: string;
  to_uuid: string;
  converse_uuid: string;
  type: ChatMessageType;
  is_public: boolean;
  is_group: boolean;
  date: string;
  data: object;
  revoke?: boolean;
}

export type ChatMessagePartial = Partial<ChatMessagePayload>;
