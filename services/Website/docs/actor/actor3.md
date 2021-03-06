---
id: actor3
title: 进阶能力
---

## 动态语句

在大部分的组件中, 组件的参数都支持动态输入。

比如以下两种写法是完全等价的:
```xml
<Select name="静态下拉框" options="选项A,选项B,选项C" />
```

```xml
<Select name="动态下拉框" :options="['选项A','选项B','选项C']" />
```

通过动态变量, 我们可以通过一些逻辑操作来达成一些互动效果

比如如下配置, 实现了一个根据选择的城市动态生成区域选项的逻辑

```xml layoutTemplate
<?xml version="1.0" encoding="utf-8" ?>
<Template>
  <Static name="city" value="{'北京': ['朝阳区'], '上海': ['黄浦区', '虹口区']}" />

  <Select name="城市" options="北京,上海" />
  <Select name="区域" :options="city[城市]" />
</Template>
```
- 第一步我们使用 `Static` 创建了一个静态变量, 为全局分配了一个对象。
- 第二步我们创建了一个 `Select` 选择器, 给定静态的选项: `北京`、`上海`
- 第三步我们创建了一个 `Select` 选择器, 使用`:`标记options后面的值为一个动态语句, 即从`city`中访问`城市`变量的值
  - 例: 如果城市为`上海`, 那么区域的选项为`city[上海]`, 即为 `['黄浦区', '虹口区']`
