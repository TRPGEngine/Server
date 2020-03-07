import Debug from 'debug';
const debug = Debug('trpg:component:dice');
import * as event from './event';
import BasePackage from 'lib/package';
import DiceLogDefinition, { DiceLog } from './models/log';

export default class Dice extends BasePackage {
  public name: string = 'Dice';
  public require: string[] = ['Player', 'Chat', 'Group'];
  public desc: string = '投骰模块';

  onInit() {
    this.initStorage();
    this.initFunction();
    this.initSocket();
    this.initTimer();
  }

  initStorage() {
    this.regModel(DiceLogDefinition);
  }

  initFunction() {
    const app = this.app;

    this.regMethods({
      rollPoint: function rollPoint(maxPoint, minPoint = 1) {
        maxPoint = parseInt(String(maxPoint));
        minPoint = parseInt(String(minPoint));
        if (maxPoint <= 1) {
          maxPoint = 100;
        }
        if (maxPoint < minPoint) {
          maxPoint = minPoint + 1;
        }

        var range = maxPoint - minPoint + 1;
        var rand = Math.random();
        return minPoint + Math.floor(rand * range);
      },
      roll: function roll(requestStr) {
        try {
          let pattern = /(\d*)\s*d\s*(\d*)/gi;

          requestStr = requestStr.replace(/[^\dd\+-\/\*]+/gi, ''); //去除无效或危险字符
          let express = requestStr.replace(pattern, function(tag, num, dice) {
            num = num || 1;
            dice = dice || 100;
            let res = [];
            for (var i = 0; i < num; i++) {
              res.push(app.dice.rollPoint(dice));
            }

            if (num > 1) {
              return '(' + res.join('+') + ')';
            } else {
              return res.join('+');
            }
          });

          let result = eval(express);
          let str = requestStr + '=' + express + '=' + result;
          return {
            result: true,
            str,
            value: result,
          };
        } catch (err) {
          debug('dice error :' + err);
          return {
            result: false,
            str: '投骰表达式错误，无法进行运算',
          };
        }
      },
      sendDiceResult: async function sendDiceResult(
        sender_uuid,
        to_uuid,
        is_group,
        roll_msg
      ) {
        // TODO: 需要修改文本。如:XXX 因为 YYY 投掷了1d100, 而不是照搬
        if (!!is_group) {
          // 团内投骰
          app.chat.sendMsg('trpgdice', null, {
            message: roll_msg,
            converse_uuid: is_group ? to_uuid : '',
            type: 'tip',
            is_public: true,
            is_group,
          });
        } else {
          // 私人投骰
          app.chat.sendMsg(sender_uuid, to_uuid, {
            message: roll_msg,
            converse_uuid: null,
            type: 'tip',
            is_public: false,
            is_group,
          });
          app.chat.sendMsg(to_uuid, sender_uuid, {
            message: roll_msg,
            converse_uuid: null,
            type: 'tip',
            is_public: false,
            is_group,
          });
        }
      },
    });
  }

  initSocket() {
    this.regSocketEvent('roll', event.roll);
    this.regSocketEvent('sendDiceRequest', event.sendDiceRequest);
    this.regSocketEvent('acceptDiceRequest', event.acceptDiceRequest);
    this.regSocketEvent('sendDiceInvite', event.sendDiceInvite);
    this.regSocketEvent('acceptDiceInvite', event.acceptDiceInvite);
    this.regSocketEvent('sendQuickDice', event.sendQuickDice);
  }

  initTimer() {
    this.regStatJob('diceLogCount', async () => {
      const res = await DiceLog.count();
      return res;
    });
  }
}
