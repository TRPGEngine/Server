# TRPG Engine Docker 部署

**WIP**

*`./docker-compose.dev.yml`可以改为自己的配置*

## 运行程序
```bash
docker-compose -f docker-compose.env.yml -f ./docker-compose.dev.yml up -d
```

## 首次运行

```bash
# 生成数据库
docker-compose -f docker-compose.env.yml -f ./docker-compose.dev.yml exec -- trpg-server npm run db:migrate:run

# 生成默认数据
docker-compose -f docker-compose.env.yml -f ./docker-compose.dev.yml exec -- trpg-server npm run db:seeder:run
```

## 生产环境部署

### Docker Swarm 部署

首次部署别忘了运行前面的命令创建数据库表

#### 如果没有现有数据库

```bash
docker stack deploy -c docker-compose.env.yml -c docker-compose.pro.yml trpg_engine
```

#### 如果有现有数据库

TODO
