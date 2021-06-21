---
id: button
title: <Button />
---

```xml
<Button />
```

一个按钮, 用于布局的高级操作

## API

| 名称         | 类型                                                              | 描述                   | 默认值    |
| ------------ | ----------------------------------------------------------------- | ---------------------- | --------- |
| showInDetail | boolean                                                           | 是否在详情视图中显示   | false     |
| type         | "text" \| "link" \| "ghost" \| "default" \| "primary" \| "dashed" | 最大值的变量名         | "default" |
| danger       | boolean                                                           | 是否是一个危险操作按钮 | false     |
| onClick      | function                                                          | 点击按钮的事件         |           |

### 示例

#### 简单按钮

```xml layoutTemplate
<Button onClick="debug('Hello World')" />
```
