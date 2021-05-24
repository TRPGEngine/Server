---
id: bar
title: <Bar />
---

```xml
<Bar />
```

一个进度条。用于显示占比。
移动到进度条上后会显示详情信息

## API

| 名称    | 类型                 | 描述   | 默认值    |
| ------- | -------------------- | ------ | --------- |
| current | number/string        | 当前值的变量名 | 0         |
| max     | number/string        | 最大值的变量名 | 0         |
| label   | string               | 标签   |           |
| color   | string               | 颜色   | "#FFA160" |
| size    | "default" \| "small" | 大小   | "default" |

### 示例

```xml layoutTemplate
<?xml version="1.0" encoding="utf-8" ?>
<Template>
  <InputNumber name="当前值" />
  <InputNumber name="最大值" />

  <h3>简单进度条</h3>
  <Bar current="当前值" max="最大值" />

  <h3>不同颜色</h3>
  <Bar current="当前值" max="最大值" color="#CCCCCC" />

  <h3>不同尺寸</h3>
  <Bar current="当前值" max="最大值" size="small" />

  <h3>自定义标签</h3>
  <Bar current="当前值" max="最大值" label="自定义标签" />
</Template>
```
