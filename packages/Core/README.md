# TRPG Game Engine Core

[![Build Status](https://travis-ci.org/TRPGEngine/Core.svg?branch=master)](https://travis-ci.org/TRPGEngine/Core)

----

推荐Nodejs版本为node 8 以保证依赖库能正确安装

## 配置
```javascript
const app = require('/path/to/Core')({
  ...options
});
```

**or**

```javascript
const app = require('/path/to/Core')();
app.set('option1', value1);
app.set('option2', value2);
...
```

### options
- db: 对象或字符串，如果为字符串则为连接的uri如:`postgres://user:pass@example.com:5432/dbname`, 详情可以查看[Sequelize官方文档](http://docs.sequelizejs.com/class/lib/sequelize.js~Sequelize.html#instance-constructor-constructor)
  - database: 数据库名, 必填
  - username: 数据库账号, 必填
  - password: 数据库密码, 必填
  - options
    - localhost: 连接地址
    - dialect: 数据库驱动, 可选`'mysql'|'sqlite'|'postgres'|'mssql'`
    - pool: 连接池
      - max: 最大连接数
      - min: 最小连接数
      - acquire: 最大获取时间,
      - idle: 最大闲置时间
