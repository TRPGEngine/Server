---
id: baseattr
title: <BaseAttr />
---

```xml
<BaseAttr>
  ...
</BaseAttr>
```

一个方便与`<BaseInfo />` 构成响应式的容器标签， 在宽屏模式下会保留 `<BaseInfo />` 中头像的空间来使输入框能够很方便的对齐

### 示例

```xml layoutTemplate
<?xml version="1.0" encoding="utf-8" ?>
<Template>
  <BaseInfo />
  <BaseAttr>
    <Input name="input" />
  </BaseAttr>
</Template>
```
