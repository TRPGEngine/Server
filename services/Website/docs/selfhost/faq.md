---
id: faq
title: 疑难杂症 FAQ
---

- 编译时出现: `Cannot find module '../build/Release/canvas.node'`
> `canvas` 模块没有安装成功, 执行如下命令即可: `npm_config_canvas_binary_host_mirror=https://npm.taobao.org/mirrors/node-canvas-prebuilt/ npm rebuild canvas`
