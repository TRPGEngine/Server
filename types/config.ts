import { Options } from 'sequelize/types';

export type EnvType = 'development' | 'production';

/**
 * 全局配置
 */
export interface GlobalConfig {
  env: EnvType;
  port: string;
  apihost: string;
  verbose: boolean;
  db: DBConfig;
  graphql: GraphQLConfig;
  jwt: JWTConfig;
  dashboard: DashboardConfig;
  redisUrl: string;
  webserviceHomepage: string;
  oauth: OAuthConfig;
  mail: MailConfig;
  notify: NotifyConfig;
}

/**
 * 数据库相关配置
 */
export interface DBConfig {
  database: string;
  username: string;
  password: string;
  options: Options;
}

/**
 * GraphQL 相关配置
 */
export interface GraphQLConfig {
  enable: boolean;
}

/**
 * Json Web Token 相关配置
 */
export interface JWTConfig {
  secret: string; // 任意长度秘钥，用于加密jwt，默认为10位随机字符串
}

/**
 * 控制台相关配置
 */
export interface DashboardConfig {
  /**
   * 管理员账号列表
   */
  admin: Array<{ username: string; password: string }>;
}

/**
 * OAuth 相关配置
 */
export interface OAuthConfig {
  /**
   * QQ互联
   */
  qqconnect: {
    appid: string;
    appkey: string;
    callback: string;
    scope: string[];
  };
}

/**
 * 邮件相关配置
 */
export interface MailConfig {
  aeskey: string; // 32位秘钥, 用于加密激发信息
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
}

/**
 * 通知相关配置
 */
export interface NotifyConfig {
  /**
   * 极光推送相关配置
   */
  jpush: {
    appKey: string;
    masterSecret: string;
  };
}
