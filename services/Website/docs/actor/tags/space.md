---
id: space
title: <Space />
---

```xml
<Space>
  ...
</Space>
```

设置组件之间的间距。

## 何时使用

避免组件紧贴在一起，拉开统一的空间。

## API

| 名称      | 类型                                       | 说明     | 默认值       | 
| --------- | ------------------------------------------ | -------- | ------------ | 
| size      | `small` \| `middle` \| `large` \| `number` | 间距大小 | `small`      | 
| direction | `vertical` \| `horizontal`                 | 间距方向 | `horizontal` | 

:::note
该容器不应该用于作为`Foreach/CustomList`组件的父级
`Foreach/CustomList`组件的间隔应该在内部处理间隔
:::
