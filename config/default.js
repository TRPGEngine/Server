const randomString = require('crypto-random-string');

module.exports = {
  db: {
    database: 'trpg',
    username: 'root',
    password: '',
    options: {
      host: 'localhost',
      dialect: 'mysql',
      operatorsAliases: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
    }
  },
  dashboard: {
    // dashboard模块网页端的账号密码
    admin: [{
      username: 'trpgadmin',
      password: randomString(16)
    }]
  },
  webserviceHomepage: '/admin/home',
  apihost: 'http://127.0.0.1:23256',
  oauth: {
    // qq互联相关信息 required!
    qqconnect: {
      "appid": "",
      "appkey": "",
      "callback": "/oauth/qq/callback",
      "scope": ["get_user_info"]
    }
  },
  mail: {
    aeskey: "", // 32位秘钥
    smtp: {
      host: "",
      port: 465,
      secure: true,
      auth: {
        user: "",
        pass: ""
      }
    }
  }
}
