# Server

[![CircleCI](https://circleci.com/gh/TRPGEngine/Server.svg?style=svg)](https://circleci.com/gh/TRPGEngine/Server)
[![codecov](https://codecov.io/gh/TRPGEngine/Server/branch/master/graph/badge.svg)](https://codecov.io/gh/TRPGEngine/Server)

## 安装环境

本项目基于`NodeJS`，因此服务器上必须配备`NodeJS`才能正常运行本服务器。  
同时本项目使用`npm`进行包管理，由于安装`NodeJS`环境的时候会自动安装`npm`因此无需另外安装。

建议的Node版本: 10.19.0

**安装依赖环境**
```bash
# 安装所有环境
npm install

# 安装生产环境
npm install --production
```

**运行脚本**
```bash
npm start
```

## 创建/重建数据库
```bash
npm run dbreset
```
初始账号密码:admin/admin


## 数据库编码

因为用户的输入奇奇怪怪。所以请确保数据库字符集为`utf8mb4`, 至少要确保`chat_log.message`的编码方式为`utf8mb4`
