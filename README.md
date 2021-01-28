# Server

[![CircleCI](https://circleci.com/gh/TRPGEngine/Server.svg?style=svg)](https://circleci.com/gh/TRPGEngine/Server)
[![codecov](https://codecov.io/gh/TRPGEngine/Server/branch/master/graph/badge.svg)](https://codecov.io/gh/TRPGEngine/Server)
![deploy doc website](https://github.com/TRPGEngine/Server/workflows/deploy%20doc%20website/badge.svg?branch=docs)

## 安装环境

本项目基于`NodeJS`，因此服务器上必须配备`NodeJS`才能正常运行本服务器。  
同时本项目使用`npm`进行包管理，由于安装`NodeJS`环境的时候会自动安装`npm`因此无需另外安装。

建议的Node版本: `v10.19.0`

需要依赖:
- Redis
- MySQL

前端项目: [TRPGEngine/Client](https://github.com/TRPGEngine/Client)

## 配置代码依赖
```bash
# 安装所有环境
$ npm install && npm run packages:ci
```

## 配置数据库
本项目基于[config](https://www.npmjs.com/package/config)作为配置管理方案

创建`config/local.js`文件, 参考`config/default.js`的内容进行配置的覆写

你可以以以下的配置例子作为起步配置
```javascript
module.exports = {
  db: {
    database: 'trpg',
    username: 'root',
    password: 'root',
    options: {
      host: 'localhost',
      dialect: 'mysql',
    },
  },
  jwt: {
    secret: 'any string',
  },
  redisUrl: 'redis://127.0.0.1:6379/8',
};

```

写入数据库结构
```bash
$ npm run db:migrate:run
```

写入默认数据
```bash
$ npm run db:seeder:run
```

## 运行服务器

```bash
$ npm run dev
# or 
$ npm run pro
```

## 数据库编码

因为用户的输入奇奇怪怪。所以请确保数据库字符集为`utf8mb4`, 至少要确保`chat_log.message`的编码方式为`utf8mb4`
