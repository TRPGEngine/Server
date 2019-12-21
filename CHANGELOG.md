# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.4.0](https://github.com/TRPGEngine/Server/compare/v1.3.0...v1.4.0) (2019-12-21)


### Features

* **chat:** 消息撤回ChatLog.revokeMsg ([3403f13](https://github.com/TRPGEngine/Server/commit/3403f13cc8eb5051e0d056ad4553c617d7c50766))
* **core:** 增加package的检查，列出功能 ([0976dc9](https://github.com/TRPGEngine/Server/commit/0976dc906e0dffe14e89a79368c62eaaf8f797c3))
* **core:** 增加report error 的开关 ([9da862d](https://github.com/TRPGEngine/Server/commit/9da862dedb0b4f8be490c864cea63e3f10f7eb81))
* **group:** 搜索时过滤不允许被搜索到的团 ([b9414cf](https://github.com/TRPGEngine/Server/commit/b9414cfc1855ad440a7d1c67f14c4a2abd9113a4))
* **group:** 用户加入与退出团都会通知团所有成员更新成员列表 ([681f775](https://github.com/TRPGEngine/Server/commit/681f77582c55a0b8695c861c875ac434e6e74901))
* **notify:** 增加激活推送与取消推送的接口。并修改了用户uuid的获取 ([afd4f72](https://github.com/TRPGEngine/Server/commit/afd4f7257e7554c064700a9b9e15ee2c7e9f1347))


### Bug Fixes

* 修复/deploy/version/latest参数获取错误的bug ([ba4eec8](https://github.com/TRPGEngine/Server/commit/ba4eec8e281cae8ad0d215093a3c79cbf4d45ce9))

## [1.3.0](https://github.com/TRPGEngine/Server/compare/v1.2.19...v1.3.0) (2019-12-13)


### Features

* **actor:** 增加删除人物卡的路由 ([30ece93](https://github.com/TRPGEngine/Server/commit/30ece939c2f74c43f3fd9ec25afe2b4ce26105f4))
* **actor:** 增加返回推荐模板列表的路由 ([61f5b6e](https://github.com/TRPGEngine/Server/commit/61f5b6e37a6cf4c401e33eb0aa7748d3e7f6c4d5))
* **group:** 增加移除团角色的操作 ([94c1892](https://github.com/TRPGEngine/Server/commit/94c1892375c175af0e1700b0aeddf04cc630194c))
* **group:** 当用户加入团后，发送系统提示到团会话中 ([fd2ba5b](https://github.com/TRPGEngine/Server/commit/fd2ba5b71fbbf81b65a74d1e390cb6b7580f9432))

### 1.2.19 (2019-12-07)


### Bug Fixes

* **core:** 修复监听socket事件数据为null时会导致服务崩溃的bug ([9611a5f](https://github.com/TRPGEngine/Server/commit/9611a5f723f3a400784792ec71e7aa2bc19519b0))
