import BasePackage from 'lib/package';
import Debug from 'debug';
import { TRPGRecruit } from 'packages/TRPG/lib/models/recruit';
import { buildWatchFunctionWrapAsync } from 'lib/listener';
import { recruitMsg } from './template/recruit';
import { requestCQHttp } from './utils';
import htmlToText from 'html-to-text';
import BotOperationLogDefinition from './models/operation-log';
import BotMsgTokenDefinition from './models/msg-token';
import msgRouter from './routers/msg';
import BotAppDefinition from './models/app';
import appRouter from './routers/app';
import { appLogin } from './event';
const debug = Debug('trpg:component:bot');

export default class Bot extends BasePackage {
  public name: string = 'Bot';
  public require: string[] = ['chat', 'group', 'TRPG'];
  public desc: string =
    '一个机器人模块，将外部的消息转发到内部或者把内部的事件推送到外部';

  onInit(): void {
    const enable = this.getConfig('bot.enable', false);
    this.regModel(BotOperationLogDefinition);
    this.regModel(BotMsgTokenDefinition);
    this.regModel(BotAppDefinition);

    if (!enable) {
      debug('无法加载Bot组件: 在配置中已关闭');
      return;
    }

    this.regRoute(msgRouter);
    this.regRoute(appRouter);

    this.regSocketEvent('appLogin', appLogin);

    this.initListener();
  }

  initListener() {
    const target = this.getConfig('bot.qqbot.target', {}) as any;
    if (typeof target.id === 'string' && target.id !== '') {
      // 仅有ID时生效
      if (target.type === 'private' || target.type === 'group') {
        // 监听创建招募操作并发送到QQ机器人
        TRPGRecruit.createTRPGRecruit = buildWatchFunctionWrapAsync(
          TRPGRecruit.createTRPGRecruit,
          (ctx) => {
            const result: TRPGRecruit = ctx.result;
            const { title, content, author } = result;

            const message = recruitMsg(
              title,
              htmlToText.fromString(content, {
                wordwrap: false,
                singleNewLineParagraphs: true,
              }),
              author
            );

            if (target.type === 'private') {
              requestCQHttp('/send_private_msg_rate_limited', {
                user_id: target.id,
                message,
              });
            } else if (target.type === 'group') {
              requestCQHttp('/send_group_msg_rate_limited', {
                group_id: target.id,
                message,
              });
            }
          }
        );
      }
    }
  }
}
