# 这个文档记录检查脏数据所用的sql语句

打印错误的信息
这个错误来自于广播消息后客户端将团uuid视为用户uuid

```sql
select * from chat_log inner join group_group on chat_log.sender_uuid = group_group.uuid order by chat_log.id desc limit 10 \G
select * from chat_log inner join group_group on chat_log.to_uuid = group_group.uuid order by chat_log.id desc limit 10 \G
```
