# Server

## 安装环境

本项目基于`NodeJS`，因此服务器上必须配备`NodeJS`才能正常运行本服务器。  
同时本项目使用`npm`进行包管理，由于安装`NodeJS`环境的时候会自动安装`npm`因此无需另外安装。

建议的Node版本: 10.16

**安装依赖环境**
```bash
# 安装所有环境
npm install

# 安装生产环境
npm install --production
```

**推荐的Node版本号**
```bash
v8.11.3
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
