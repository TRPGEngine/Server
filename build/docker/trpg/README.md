# TRPG Engine Docker 部署

**WIP**

*`./docker-compose.dev.yml`可以改为自己的配置*

## 运行程序
```bash
docker-compose -f docker-compose.env.yml -f ./docker-compose.dev.yml up -d
```

## 首次运行

**注意: 以下操作至少需要2G内存**

```bash
# 生成数据库
docker-compose -f docker-compose.env.yml -f ./docker-compose.dev.yml exec trpg-server npm run db:migrate:run

# 生成默认数据
docker-compose -f docker-compose.env.yml -f ./docker-compose.dev.yml exec trpg-server npm run db:seeder:run
```

## 生产环境部署

### Docker Swarm 部署

首次部署别忘了运行前面的命令创建数据库表

#### 如果没有现有数据库

```bash
docker stack deploy -c docker-compose.env.yml -c docker-compose.swarm.yml trpg_engine
```

#### 如果有现有数据库

##### 第一步: 创建overlay类型的网络

```bash
docker network create -d overlay --attachable trpg_swarm
```

`--attachable` 表示可以被独立容器连接

##### 第二步: 将已有数据库容器连接到刚刚创建的网络

```bash
docker network connect trpg_swarm [trpg_mysql_1]
docker network connect trpg_swarm [trpg_redis_1]
```

##### 第三步: 编辑配置并启动服务

修改配置文件(`Server/build/docker/trpg/config/local.js`)
```
db.options.host => trpg_mysql_1

redisUrl => redis://trpg_redis_1:6379/8
```

```bash
docker stack deploy -c docker-compose.swarm.yml trpg_engine
docker service update --network-add trpg_swarm trpg_engine_trpg-server
```

## 更新版本

#### 拉取新镜像
```
docker pull moonrailgun/trpg-server:latest
docker stack deploy -c docker-compose.swarm.yml trpg_engine
```
