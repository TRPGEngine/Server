# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.9.0](https://github.com/TRPGEngine/Server/compare/v1.8.0...v1.9.0) (2020-02-21)


### Features

* **actor:** 增加创建模板的接口 ([5b4b7fd](https://github.com/TRPGEngine/Server/commit/5b4b7fdc7b0815901ed1feb627e7ca8da8165aad))
* **chat:** 增加多人会话的创建 ([e03c652](https://github.com/TRPGEngine/Server/commit/e03c652148cfe9a5ac06710471b4c86c17d4347f))
* **group:** 增加group rule 字段并抽象更新逻辑 ([c952c2e](https://github.com/TRPGEngine/Server/commit/c952c2e56ce5a1a6d8c71bc33ae0ec5a71d63120))


### Bug Fixes

* 修复dice包代发tip消息类型出现问题的bug ([287dd6f](https://github.com/TRPGEngine/Server/commit/287dd6fce76bc3817083c9e0a60fce3fe552a87e))
* **chat:** 修复加了消息类型黑名单后无法发送人物卡的问题 ([abe7730](https://github.com/TRPGEngine/Server/commit/abe77305f43439e84b1c1d376a317b94cd70f8e0))

## [1.8.0](https://github.com/TRPGEngine/Server/compare/v1.7.1...v1.8.0) (2020-02-07)


### Features

* **group:** 获取用户数据时会返回成员数 ([bab81cf](https://github.com/TRPGEngine/Server/commit/bab81cf77d7e9089d83f5b584933c82a2ede172e))


### Bug Fixes

* **chat:** 修复用户可以伪造发送者的bug ([123a30f](https://github.com/TRPGEngine/Server/commit/123a30fa2fd2c776c3c5fafd15347b84225cf138))
* **chat:** 修复用户可以直接发送card, tip类型数据而服务器不过经过任何处理的问题 ([944d9e1](https://github.com/TRPGEngine/Server/commit/944d9e102e3ded78e270f466a1771b466b7d8dcd))

### [1.7.1](https://github.com/TRPGEngine/Server/compare/v1.7.0...v1.7.1) (2020-01-23)

## [1.7.0](https://github.com/TRPGEngine/Server/compare/v1.6.0...v1.7.0) (2020-01-17)


### Features

* **chatemotion:** 增加doutula的爬虫实现 ([86dfb4f](https://github.com/TRPGEngine/Server/commit/86dfb4fb235644e9616bddfaca9e806983efe51f))

## [1.6.0](https://github.com/TRPGEngine/Server/compare/v1.5.3...v1.6.0) (2020-01-10)


### Features

* **chat:** 移除message的xss处理。使用react原生的xss来进行xss的处理 ([cc140d9](https://github.com/TRPGEngine/Server/commit/cc140d908677bd4a756e3989afc3dad37b7f356d))

### [1.5.3](https://github.com/TRPGEngine/Server/compare/v1.5.2...v1.5.3) (2020-01-03)


### Bug Fixes

* 修复在某些情况下无法更新人物卡的bug ([378bdb1](https://github.com/TRPGEngine/Server/commit/378bdb1ec126e48782b004ae6ccae5acad0093f3))

### [1.5.2](https://github.com/TRPGEngine/Server/compare/v1.5.1...v1.5.2) (2020-01-03)


### Bug Fixes

* **player:** 修复修改密码后无法正常登陆的问题 ([7d3b6ab](https://github.com/TRPGEngine/Server/commit/7d3b6abe818c222a01f9efffaf8090352302eeff))

### [1.5.1](https://github.com/TRPGEngine/Server/compare/v1.5.0...v1.5.1) (2020-01-02)


### Bug Fixes

* **chat:** 修复emoji表情无法写入数据库的问题 ([29c98a5](https://github.com/TRPGEngine/Server/commit/29c98a5d38c66f7d32aecbb2ab27059d849dd8ae))
* **player:** 修复登录时不返回token导致无法正常退出登录的bug ([5d25845](https://github.com/TRPGEngine/Server/commit/5d25845cc3cdfce227b640d87c0a217e3e8f075b))

## [1.5.0](https://github.com/TRPGEngine/Server/compare/v1.4.0...v1.5.0) (2019-12-31)


### Features

* **chat:** 处理发送消息时将客户端时间统一成服务端时间 ([97eec9f](https://github.com/TRPGEngine/Server/commit/97eec9f2d985d5b9efec16a81becac33061b8703))
* **chat:** 开放消息撤回事件 ([6da1700](https://github.com/TRPGEngine/Server/commit/6da1700a5bbc16eff8a8afc4e45e5c24f5b50462))
* **group:** 增加 GroupGroup.findGroupActorsByUUID 返回角色列表的owner的信息 ([a635f96](https://github.com/TRPGEngine/Server/commit/a635f962988b3ddf498fd9dc15066c8048ba82ed))


### Bug Fixes

* **deploy:** 修复错误的字段声明 ([2923d1f](https://github.com/TRPGEngine/Server/commit/2923d1f226747b285d28e0900d56a9084666833b))

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
