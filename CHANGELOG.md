# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.15.0](https://github.com/TRPGEngine/Server/compare/v1.14.0...v1.15.0) (2020-03-21)


### Features

* 增加了判定骰可以获取人物卡属性数据进行检定的操作 ([053e236](https://github.com/TRPGEngine/Server/commit/053e23609170c6c32d54a0918ec63367637a7aac))
* **group:** 增加了更新团人物卡信息时会发送系统消息通知的功能 ([2895de5](https://github.com/TRPGEngine/Server/commit/2895de5b59662eeb6fd263e1e438d2d50e5ab988))
* **player:** 增加接口用于获取用户信息 ([d436453](https://github.com/TRPGEngine/Server/commit/d436453e5efba9cfc464cd822dc146cc54bcbbf0))

## [1.14.0](https://github.com/TRPGEngine/Server/compare/v1.13.1...v1.14.0) (2020-03-13)


### Features

* **dice:** 增加ra判定骰的消息指令 ([85bfe0d](https://github.com/TRPGEngine/Server/commit/85bfe0d1181ef5f1f00d9f24857bc65150bef15e))
* **dice:** 增加判定骰的实现 ([82ac44c](https://github.com/TRPGEngine/Server/commit/82ac44cd22ee9d7725260a86fc5045e180efcce3))
* **group:** 增加创建子频道的接口 ([1ab92df](https://github.com/TRPGEngine/Server/commit/1ab92df55e98f528100839f37847f09a4ce2e2a0))
* **group:** 增加团详情的保存 ([b9c184c](https://github.com/TRPGEngine/Server/commit/b9c184ce3896bb37d30906a0a6a49d18746f4e2d))
* **group:** 增加获取团范围聊天记录的操作 ([186efac](https://github.com/TRPGEngine/Server/commit/186efac114fc8d6254fadfc6da0aa5289f565f2f))
* **group:** 频道的成员增加与移除 ([dcc946c](https://github.com/TRPGEngine/Server/commit/dcc946c46e17bdd562587d95a3a0f1da5fa9e58c))
* **trpg:** 增加新包 ([7e3f57b](https://github.com/TRPGEngine/Server/commit/7e3f57beb5b0451405629ac9febadb43e632b1ac))


### Bug Fixes

* **playground:** 修复博物学初始值错误的bug ([d8330a1](https://github.com/TRPGEngine/Server/commit/d8330a1b0af164e71052ea222144e3b7fb74f11e))

### [1.13.1](https://github.com/TRPGEngine/Server/compare/v1.13.0...v1.13.1) (2020-03-09)


### Bug Fixes

* **chat:** 修复用户可以广播消息的bug ([0749c5b](https://github.com/TRPGEngine/Server/commit/0749c5b9e0f8248e8fd8bf4e77ccf61f02bec4bc))

## [1.13.0](https://github.com/TRPGEngine/Server/compare/v1.12.0...v1.13.0) (2020-03-09)


### Features

* **actor:** 人物卡分享与取消分享的socket与http入口 ([337fdc4](https://github.com/TRPGEngine/Server/commit/337fdc4821041dcd294b951ea4d87baaff6bf8b0))
* **actor:** 搜索分享用户增加分页与按照更新时间排序 ([6acda6a](https://github.com/TRPGEngine/Server/commit/6acda6ac4d3cbc08a2046779838cc32e325c8d95))
* **dice:** 增加聊天信息拦截器，将用户发送的rd指令变成投骰 ([8dbd101](https://github.com/TRPGEngine/Server/commit/8dbd101b8be441a337bed8e05638982d68cd6f99))
* **player:** 增加路由用于检测用户在线情况 ([7f25e5d](https://github.com/TRPGEngine/Server/commit/7f25e5db6e31c100208a9d29aca0672c0b641e95))

## [1.12.0](https://github.com/TRPGEngine/Server/compare/v1.11.0...v1.12.0) (2020-03-06)


### Features

* **group:** 增加返回团列表时返回团的detail信息 ([9099049](https://github.com/TRPGEngine/Server/commit/9099049d60eed319a990d7ee56302f595cec0527))


### Bug Fixes

* **group:** 修复拉取团人物数据时数据不全的问题 ([b9547be](https://github.com/TRPGEngine/Server/commit/b9547bedaadd530136aae30f7d3fff6217fc6c3f))
* **group:** 修复通知传输数据不正确的问题 ([5a3e338](https://github.com/TRPGEngine/Server/commit/5a3e3384eafb936321d4be4f131f8358ec3cfc55))

## [1.11.0](https://github.com/TRPGEngine/Server/compare/v1.10.0...v1.11.0) (2020-03-04)


### Features

* 增加socket 日志信息脱敏 ([0198026](https://github.com/TRPGEngine/Server/commit/019802689dbd325065b5ffa0b246e199f80a1d2e))


### Bug Fixes

* **layout:** 修复coc7人物卡缺少兴趣点显示与资产情况计算不正确的bug ([727b9aa](https://github.com/TRPGEngine/Server/commit/727b9aa9ed261c78b0f2f93cc28560f22fa229eb))
* 修复一个可能会导致服务器崩溃的问题 ([aeccbae](https://github.com/TRPGEngine/Server/commit/aeccbae1abea9b62e813b63bd45cb50496f31b9a))

## [1.10.0](https://github.com/TRPGEngine/Server/compare/v1.9.0...v1.10.0) (2020-02-28)


### Features

* 增加loggly 日志支持 ([12ed7bf](https://github.com/TRPGEngine/Server/commit/12ed7bf43c465188856c657511344acfd8c375ac))
* **actor:** 人物的分享与fork ([c9586d4](https://github.com/TRPGEngine/Server/commit/c9586d419a3f3f179cdaf6fa5b3f93f43715ea03))
* **core:** 增加http请求的路由日志 ([050e94c](https://github.com/TRPGEngine/Server/commit/050e94c1348d52cf942082efea780e763612ebaf))
* **file:** 增加v2版本的allowmime中间件和thumbnail中间件 ([e82c584](https://github.com/TRPGEngine/Server/commit/e82c584bd4095dbfa33d47d203cc841f1fca6cfd))
* **file:** 增加存储到远程oss的文件管理中间件与存储记录 ([b28d351](https://github.com/TRPGEngine/Server/commit/b28d35192797494d9e462e776a581317fa707cc7))
* **file:** 增加第二版avatar路由 ([d689e4e](https://github.com/TRPGEngine/Server/commit/d689e4e4f2a97b1d7a5e5dbcc0c55edf074866ca))
* **group:** 增加group_channel模型 ([41a19be](https://github.com/TRPGEngine/Server/commit/41a19be535d7d4932df98f76b02471ee38e355f4))
* **group:** 增加团信息编辑后通知更新团信息 ([c5f23c1](https://github.com/TRPGEngine/Server/commit/c5f23c1fe1b5cb491b22fef857470bf950ea2149))
* **group:** 增加团角色编辑与通过时通知所有用户更新团角色信息的操作 ([3259e33](https://github.com/TRPGEngine/Server/commit/3259e332065a200cc54cf9556bcfe3f73bc96f87))


### Bug Fixes

* 修复loggly没有配置时无法启动的问题 ([bcb87a2](https://github.com/TRPGEngine/Server/commit/bcb87a2938960fd65bee852776f9307c2d2d84bb))
* **file:** 修复部分事务没有被真正应用的问题 ([7dd77e0](https://github.com/TRPGEngine/Server/commit/7dd77e0dabb27f481363765ab60205236f7f6fb2))

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
