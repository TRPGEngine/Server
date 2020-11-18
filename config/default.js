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
  heapdump: false, // debug 内存
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379/8',
  db: {
    database: process.env.DB_NAME || 'trpg',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    options: {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'mysql',
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    },
  },
  // 欢迎信息，支持bbcode语法
  welcomeMsg: '欢迎注册使用TRPG Engine, [url=https://trpgdoc.moonrailgun.com/docs/quick-start]三分钟快速学习[/url]或者自行摸索。如果您觉得这个应用还不错，欢迎推荐给您的好友哦。\n祝你游戏愉快。',
  rateLimit: {
    points: 400, // 请求点数 可以看做是单位时间请求数
    duration: 20, // 单位时间 单位为秒
    register: {
      // 每3小时可以注册4次
      points: 40,
      duration: 3 * 60 * 60
    },
    whitelist: {
      // 白名单。白名单内的操作不会被限流
      ws: ['player::getInfo'],
    }
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
