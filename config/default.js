const randomString = require('crypto-random-string');
const packageConfig = require('../package.json');

module.exports = {
  version: packageConfig.version,
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
  rateLimit: {
    points: 200, // 请求点数 可以看做是单位时间请求数
    duration: 20, // 单位时间 单位为秒
  },
  graphql: {
    // 默认在开发环境打开GraphQL
    enable: process.env.NODE_ENV === 'development' ? true : false,
  },
  jwt: {
    // json web token 相关设定
    // 注意: 因为这里每次启动都不一样。因此重复重启可能会出现校验不通过的问题
    // 解决方法是在local配置中设置一个默认的secret
    // 该问题不能用close task来清除redis来解决, 因为会出现多实例反复关闭的问题
    secret: randomString(10),
  },
  logger: {
    type: 'local', // 可选: local,loggly
    loggly: {
      token: '',
      subdomain: '',
      tags: ['trpg-server'],
    },
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
  webserviceHomepage: '/dashboard/home',
  file: {
    storage: 'local', // local, qiniu等
    oss: {
      qiniu: {
        domain: '', // 外链站点 http://example.com/
        accessKey: '',
        secretKey: '',
        bucket: '',
      },
      maoyun: {
        domain: '', // 外链站点 http://example.com/
        appId: '',
        appSecret: '',
        bucketId: '', // 猫云控制台地址栏的id
      },
    },
    forward: {
      chatimg: {
        url: '',
        headers: {},
      },
    },
    clean: {
      // 定期清理
      avatar: false, // 定期清理avatar
      temporary: true, // 定期清理临时文件夹
    },
  },
  report: {
    enable: true,
  },
  oauth: {
    enabled: ['qq'],
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
  trpg: {
    map: {
      enable: true,
    },
  },
  bot: {
    enable: false,
    qqbot: {
      url: '',
      accessToken: '', // 发送到QQ机器人的授权
      secret: '', // 事件上报的签名
      target: {
        type: 'private',
        id: '',
      },
    },
  },
};
