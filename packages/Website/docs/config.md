---
id: config
title: 配置
---

本项目是用[config](https://www.npmjs.com/package/config)来管理配置的加载。其配置的加载顺序为
```
default -> env -> local
```
后加载的配置会覆盖之前的配置。 具体内容可以查看[config](https://www.npmjs.com/package/config)的说明


## 前端配置

因为前端的配置不像后端一下可以动态加载，前端在执行代码前会进行打包处理。

### Web

对于web项目来说，使用了webpack将[config](https://www.npmjs.com/package/config)进行替换。使其可以以**类似node**的形式进行加载
```
import config from 'config';
```

### React-Native

对于react-native项目来说。使用了[react-native-config](https://www.npmjs.com/package/react-native-config)来对各个环节的配置进行统一的调控。在使用前需要先执行`npm run app:build:env`将config的配置转化为[react-native-config](https://www.npmjs.com/package/react-native-config)可用的类型。特别的, 会将所有的配置设定为全大写。并将嵌套内容扁平化并用`_`分割

如以下配置:
```json
{
  sentry: {
    dsn: 'xxxxxx'
  },
  version: "0.1.10"
}
```
会转换为:
```
SENTRY_DSN=xxxxxx
VERSION=0.1.10
```
