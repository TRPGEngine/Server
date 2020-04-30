---
title: 版本发布0.3.2
author: moonrailgun
tags: [版本发布]
---

版本发布`v0.3.2` 更新说明:

- 增加了DND5e人物卡
- 增加了部分骰子图标, 重绘了所有的骰子图标(感谢`猫斯基`的贡献)

## App

- 增加了关于页面。增加了官网的连接
- 增加了团规则

## 文档官网

- 增加了文档搜索引擎[Algolia DocSearch](https://docsearch.algolia.com/)
- 增加了Wiki系统。结合文档搜索引擎来实现快速搜索
  - 增加了DND5e的法术详情wiki(共361条)
  - 增加了部分其他TRPG资源的连接
- 增加了部分组件的文档
  - Bar
  - Space
- 移除了部分不必要的文档

## Playground

- 增加了DND5e的人物卡模板源码

<!--truncate-->

## 人物卡布局系统

- 增加了新的组件
  - 增加了`CurrMax`组件
  - 增加了`CustomList`组件
  - 增加了`Space`组件
- 所有的表单组件增加了`inline`用于内联标签
- 部分组件增加了`style`属性
- 修改了`ForEach`组件。使其部分内容可以被`CustomList`复用
- `Select`增加了placeholder属性。默认为`请选择...`
- `Tab`默认宽度为`100%`


## 优化

- 抽象了人物卡布局的状态管理机制
- 抽象了Playground的代码

#### 构建系统

- 生产环境编译增加最小文件限制，减少细碎文件。防止太多并发请求创建太多TCP连接
- ~~移除@babel/plugin-transform-modules-commonjs以应用摇树优化(减少@ant-design/icons的大小)~~


## 服务端
版本: `v1.19.0`

- 增加了招募模型以及配套的增加更新查询接口
- 增加了招募rss订阅页面
- 增加了`pdf-helper`服务用于解析pdf文档
