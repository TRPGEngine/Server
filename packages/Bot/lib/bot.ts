import BasePackage from 'lib/package';
import Debug from 'debug';
import { TRPGRecruit } from 'packages/TRPG/lib/models/recruit';
import { buildWatchFunctionWrapAsync } from 'lib/listener';
import { recruitMsg } from './template/recruit';
import { requestCQHttp } from './utils';
const debug = Debug('trpg:component:bot');

export default class Bot extends BasePackage {
  public name: string = 'Bot';
  public require: string[] = ['TRPG'];
  public desc: string =
    '一个机器人模块，将外部的消息转发到内部或者把内部的事件推送到外部';

  onInit(): void {
    const enable = this.getConfig('bot.enable', false);
    if (!enable) {
      debug('无法加载Bot组件: 在配置中已关闭');
      return;
    }

    this.initListener();
  }

  initListener() {
    const target = this.getConfig('bot.qqbot.target', {}) as any;
    if (target.type === 'private' || target.type === 'group') {
      TRPGRecruit.createTRPGRecruit = buildWatchFunctionWrapAsync(
        TRPGRecruit.createTRPGRecruit,
        (ctx) => {
          const result: TRPGRecruit = ctx.result;
          const { title, content, author } = result;

          const message = recruitMsg(title, content, author);

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
