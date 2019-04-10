const debug = require('debug')('trpg:component:dice');
const event = require('./event');

module.exports = function DiceComponent(app) {
  initStorage.call(app);
  initFunction.call(app);
  initSocket.call(app);
  initTimer.call(app);

  return {
    name: 'DiceComponent',
    require: ['PlayerComponent', 'ChatComponent', 'GroupComponent'],
  };
};

function initStorage() {
  let app = this;
  let storage = app.storage;
  storage.registerModel(require('./models/log.js'));

  app.on('initCompleted', function(app) {
    // 数据信息统计
    debug('storage has been load 1 dice db model');
  });
}

function initFunction() {
  let app = this;
  app.dice = {
    rollPoint: function rollPoint(maxPoint, minPoint = 1) {
      maxPoint = parseInt(maxPoint);
      minPoint = parseInt(minPoint);
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
        });
      } else {
        // 私人投骰
        app.chat.sendMsg(sender_uuid, to_uuid, {
          message: roll_msg,
          converse_uuid: null,
          type: 'tip',
          is_public: false,
        });
        app.chat.sendMsg(to_uuid, sender_uuid, {
          message: roll_msg,
          converse_uuid: null,
          type: 'tip',
          is_public: false,
        });
      }
    },
  };
}

function initSocket() {
  let app = this;
  app.registerEvent('dice::roll', event.roll);
  app.registerEvent('dice::sendDiceRequest', event.sendDiceRequest);
  app.registerEvent('dice::acceptDiceRequest', event.acceptDiceRequest);
  app.registerEvent('dice::sendDiceInvite', event.sendDiceInvite);
  app.registerEvent('dice::acceptDiceInvite', event.acceptDiceInvite);
  app.registerEvent('dice::sendQuickDice', event.sendQuickDice);
}

function initTimer() {
  let app = this;

  app.registerStatJob('diceLogCount', async () => {
    const db = app.storage.db;
    let res = await db.models.dice_log.count();
    return res;
  });
}
