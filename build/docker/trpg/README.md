# TRPG Engine Docker 部署

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
