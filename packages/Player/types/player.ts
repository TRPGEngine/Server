export type Platform = 'web' | 'app';

export interface PlayerJWTPayload {
  uuid: string;
  name: string;
  avatar: string;
}
