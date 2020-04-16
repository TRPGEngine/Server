---
id: select
title: <Select />
---

```xml
<Select name="下拉选择" options="选项A,选项B,选项C" />
```

下拉选择组件 用于让用户选择指定的选项

| 名称 | 类型 | 描述 | 默认值 |
| ---- | ---- | ---- | ---- | 
| name | string | 变量名，唯一标识 |  |
| options | string \| string[] \| { name: string; items: string[] }[] | 下拉选项 | |
| desc | string | 变量描述 | |
| showSearch | boolean | 是否允许搜索 | false |
| default | string | 默认值 | |
| strict | boolean | 是否开启严格模式, 如果开启严格模式且当值在数据中不存在时, 显示一个警告 | false |
| allowCustom | boolean | 是否允许增加自定义 | |

### 示例

#### 简单下拉框
```xml
<Select name="下拉选择" options="选项A,选项B,选项C" />
```

#### 下拉框分组

```xml
<Select name="下拉选择分组" :options="[{name: '组1', items: ['选项A', '选项B']}, {name: '组2', items: ['选项C']}]" />
```

#### 严格模式

```xml
<Computed target="下拉选择严格模式" expression="'选项D'" />
<Select name="下拉选择严格模式" options="选项A,选项B,选项C" strict="true" />
```

使用`Computed`组件填入变量的值。此时Select匹配的数据为`选项D`。 因为此时的值不为设定的`选项A`,`选项B`,`选项C`中任意一项，因此会出现黄色警告

#### 自定义
```xml
<Select name="下拉选择允许自定义" options="选项A,选项B,选项C" :allowCustom="true" />
```
