---
id: input
title: <Input />
---

```xml
<Input name="输入框" />
```

输入框

## API

| 名称        | 类型   | 描述                   | 默认值 |
| ----------- | ------ | ---------------------- | ------ |
| name        | string | 变量名，唯一标识，必填 |        |
| label       | string | 标签名                 |        |
| placeholder | string | 标签名                 |        |

### 示例

#### 简单输入

```xml layoutTemplate
<Input name="输入框" />
```

#### 自定义标签

```xml layoutTemplate
<Input name="输入框" label="标签" />
```

#### 自定义 placeholder

```xml layoutTemplate
<Input name="输入框" label="标签" placeholder="placeholder" />
```
