---
id: selfhost
title: 自部署服务
---

下载两个`TRPG Engine`的前端两个项目:

- [TRPGEngine/Client](https://github.com/TRPGEngine/Client)
- [TRPGEngine/Server](https://github.com/TRPGEngine/Server)

并确保已经安装了 
- [Docker](https://docs.docker.com/engine/install/) 服务
- [Docker Compose](https://docs.docker.com/compose/install/) 服务

## 启动后端服务

```bash
cd Server
```

```bash
cd build/docker/trpg
```

`cp config/local.dev.js config/local.js` 并根据实际情况修改配置。完整的配置可以参考 [默认配置](https://github.com/TRPGEngine/Server/blob/master/config/default.js)。 注意一定要修改`jwt.secret`为一个唯一的字符串。

```bash
docker-compose -f docker-compose.env.yml -f ./docker-compose.pro.yml up -d
```

等待一段时间

### 查看服务端日志

```bash
docker-compose -f docker-compose.env.yml -f ./docker-compose.pro.yml logs -f trpg-server
```

### 服务可用性自检

- 通过访问 `http://127.0.0.1:23256/core/health` 能成功返回请求表示服务端已成功启动
- 通过访问 `http://127.0.0.1:23256/core/dependServiceCheck` 以检验依赖服务的连通性

### 初始化数据库结构和默认参数

对于第一次使用, 请初始化数据库以确能够正确操作

**注意: 以下操作至少需要2G内存, 如果内存不足可以考虑增加交换内存, 具体可以参考[这篇文章](http://moonrailgun.com/posts/6769ba51/)**

```bash
docker-compose -f docker-compose.env.yml -f ./docker-compose.pro.yml exec trpg-server npm run db:migrate:run

# 生成默认数据
docker-compose -f docker-compose.env.yml -f ./docker-compose.pro.yml exec trpg-server npm run db:seeder:run
```

### 更新到最新后端代码

因为`TRPG Engine`一直在不断迭代，如果需要更新版本，可以使用命令

```bash
docker pull moonrailgun/trpg-server
docker-compose -f docker-compose.env.yml -f ./docker-compose.pro.yml restart
```

以更新镜像到最新版本

重启后生效

### 关闭服务端

```bash
docker-compose -f docker-compose.env.yml -f ./docker-compose.pro.yml down
```

## 编译前端代码

<!-- TODO -->

<!-- 修改前端配置以指向到自己的服务端地址
```typescript

``` -->
