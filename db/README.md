## 该文件夹用于用户数据迁移

``` bash
# 数据结构
npm run db:migrate:generate
npm run db:migrate:run

# 数据库数据
npm run db:seeder:generate
npm run db:seeder:run
```

## Usage

[sequelize-auto-migrations](https://github.com/flexxnn/sequelize-auto-migrations)

#### 生成数据库表变更文件

```bash
npm run db:migrate:generate -- --name xxx-xxx
```

### 写入预设数据库数据
```bash
# 执行所有的seeder(跳过已执行的)
npm run db:seeder:run

# 根据index执行特定seeder(可以反复执行)
npm run db:seeder:run -- -i 3
npm run db:seeder:run -- --index 3

# 根据完整文件名执行特定seeder(可以反复执行)
npm run db:seeder:run -- -f 3-seeder-dump_builtin_actor_template.js
npm run db:seeder:run -- --file 3-seeder-dump_builtin_actor_template.js
```
