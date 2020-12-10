export type Platform = 'web' | 'app' | 'cli';

export interface PlayerJWTPayload {
  uuid: string;
  name: string;
  avatar: string;
}

export interface PlayerInfoObject {
  id: number;
  uuid: string;
  username: string;
  nickname: string;
  last_login: Date;
  avatar: string;
  token: string;
  app_token: string;
  sex: string;
  sign: string;
  alignment: string;
  role: string;
  qq_number: string;
  createAt: Date;
}
