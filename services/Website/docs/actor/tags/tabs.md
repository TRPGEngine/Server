---
id: tabs
title: <Tabs />
---

```xml
<Tabs>
  <Tab label="选项卡1">内容1</Tab>
  <Tab label="选项卡2">内容2</Tab>
  <Tab label="选项卡3">内容3</Tab>
</Tabs>
```

标签页组件

可以通过标签页来区分不同的功能块。起到节省空间的作用

`Tabs` 标签的子节点必须为 `Tab` 标签， 标签内的内容是各个标签页的中的内容

## API

**Tabs**:

| 名称     | 类型                             | 描述     | 默认值 |
| -------- | -------------------------------- | -------- | ------ |
| position | "top"\|"right"\|"bottom"\|"left" | 页签位置 | 'top'  |

**Tab**:

| 名称  | 类型   | 描述               | 默认值 |
| ----- | ------ | ------------------ | ------ |
| label | string | 标签页卡头显示文字 | ''     |

### 示例

```xml layoutTemplate
<?xml version="1.0" encoding="utf-8" ?>
<Template>
  <Tabs>
    <Tab label="选项卡1">内容1</Tab>
    <Tab label="选项卡2">内容2</Tab>
    <Tab label="选项卡3">内容3</Tab>
  </Tabs>
</Template>
```
