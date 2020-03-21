---
id: actor2
title: 从一个简单的人物卡开始
---

从一个简单的人物卡开始

> TRPG Engine 是基于XML语言来描述一张人物卡模板的。XML是一种标记语言。

首先我们试图建立一个最基本的人物卡, 如下:  
[简单人物卡](http://127.0.0.1:8191/preview#code/DwfgHgtgNgBAbgUwE4GcCWB7AdgXgEQCMAdAAx4wJYDGGAJmlgOb4CuALgGYC0AHOSAD4AUMAAqCCAAcoAQzYJhMGMABCMlAgCSWDhhgB6RcrUaAgmzZIjSsQjBtTSBDKFK3MWQCMEUfIC65QEsnQENlQEP5QHsDPFd3GCwZCAR8WjkZSOiYAC4Zdgx0AC8EvABvGAgGACUMAHcUdJgAFgAaEpkwCuranhgAX1S3QyjgfRMEc0thQfEpWXlhIA)

```ActorTemplatePreviewer
<?xml version="1.0" encoding="utf-8" ?>
<Template>
  <BaseInfo />
  <BaseAttr>
    <TextArea
      label="人物卡信息"
      name="data"
      :autosize="{ minRows: 4, maxRows: 8 }"
    />
  </BaseAttr>
</Template>
```

一个最基本的人物卡有三个最基本的内建字段: 头像，名称，描述。

这三个字段会默认被显示在用户的预览上, 是不点开人物卡会显示的三个字段。对于每一张人物卡模板, 都应当内置这几个字段允许用户编辑。

令人值得高兴的是, TRPGEngine 已经帮你把这三个字段封装起来了。只需要使用一个 `Tag` 就能快速建立一个响应式的这三个字段的布局
```xml
<BaseInfo />
```

对于一个简单的人物卡来说。我们可以快速建立一个如下的布局:
```xml
<?xml version="1.0" encoding="utf-8" ?>
<Template>
  <BaseInfo />
  <BaseAttr>
    <TextArea
      label="人物卡信息"
      name="data"
      :autosize="{ minRows: 4, maxRows: 8 }"
    />
  </BaseAttr>
</Template>
```

接下来我会简单的解释一下这些布局代表了什么意思

```xml
<?xml version="1.0" encoding="utf-8" ?>
```
表示这是一个`xml`布局。 版本号是`1.0` 编码方式是 `utf-8`

这是一个对这个布局的属性说明。如无必要直接复制即可

```xml
<Template>
  ........
</Template>
```
`Template`表示下面的东西是作为人物卡的布局。所有的实际上写的布局都应当在最外层包裹一个`Template`标签

关于布局相关的说明，请查看布局文档

```xml
<BaseAttr>
```
`BaseAttr`表示子标签被包裹在一个8/12布局的容器内。这个标签是为了方便与上面的`BaseInfo`标签内的组件对齐

```xml
<TextArea
  label="人物卡信息"
  name="data"
  :autosize="{ minRows: 4, maxRows: 8 }"
/>
```
`TextArea`表示一个文本框。他具有三条属性。
- `label` 表示这个组件显示的标签内容
- `name` 表示这个组件写入的数据名(注意: 对于每一个输入组件来说，`name`都是必须的)
- `autosize` 表示这个组件接受一个对象，内容为最小显示4行最大显示8行。会根据内容大小自动伸缩。冒号开头表示他会解析输入的内容并将其计算

------------------

TRPG Engine 提供了很多内置的标签用于构建人物卡模板

同时还支持HTML标签。你可以在你的人物卡中插入任意的HTML元素，包括图片、音频、视频。。。但注意性能！你的每个无意义的布局都会为所有使用你人物卡模板的用户带来额外的负担!

本节中的一些概念:
- [xml](https://www.w3school.com.cn/xml/xml_intro.asp)
