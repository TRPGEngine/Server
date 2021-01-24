---
id: core
title: 核心包
---

## 概述

核心包 `Core` 是 `TRPG Server` 必须加载的包。它负责管理了整个后端项目的 web api, socket event, cache 等基础功能  
对外暴露了一个 App 对象。所有的 package 都应当在 app 中进行注册

其还自带了一个内部包。用于对整个后端架构的全局设置，系统日志，以及请求统计  
P.S. : 另提供了一个自动生成的 `GraphQL` 查询服务。该服务在默认情况下在生产环境是关闭的
