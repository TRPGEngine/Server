const randomString = require('crypto-random-string');

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.TRPG_PORT || '23256',
  apihost: process.env.HOST || 'http://127.0.0.1:23256', // 后台服务的对外接口, 用于外部服务
  verbose:
    process.env.VERBOSE && process.env.VERBOSE.toLowerCase() === 'true'
      ? true
      : false,
  db: {
    database: 'trpg',
    username: 'root',
    password: '',
    options: {
      host: 'localhost',
      dialect: 'mysql',
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    },
  },
  graphql: {
    // 默认在开发环境打开GraphQL
    enable: process.env.NODE_ENV === 'development' ? true : false,
  },
  jwt: {
    // json web token 相关设定
    secret: randomString(10),
  },
  dashboard: {
    enable: process.env.NODE_ENV === 'development' ? true : false,
    // dashboard模块网页端的账号密码
    admin: [
      {
        username: 'trpgadmin',
        password: randomString(16),
      },
    ],
  },
  redisUrl: '',
  webserviceHomepage: '/admin/home',
  file: {
    oss: {
      qiniu: {
        accessKey: '',
        secretKey: '',
        bucket: '',
      },
    },
  },
  oauth: {
    // qq互联相关信息 required!
    qqconnect: {
      appid: '',
      appkey: '',
      callback: '/oauth/qq/callback',
      scope: ['get_user_info'],
    },
  },
  mail: {
    aeskey: '', // 32位秘钥
    smtp: {
      host: '',
      port: 465,
      secure: true,
      auth: {
        user: '',
        pass: '',
      },
    },
  },
  notify: {
    // 极光推送服务端接口需要的秘钥。没有该项将无法注册notify服务
    jpush: {
      appKey: '',
      masterSecret: '',
    },
    // 友盟推送服务接口所需要的秘钥
    upush: {
      appKey: '',
      masterSecret: '',
      mipush: true,
      mi_activity: 'com.moonrailgun.trpg.MipushActivity',
    },
  },
};
