import _ from 'lodash';

const isNumberStr = (str) => /^\d*$/.test(str);

/**
 * 在一定范围内取随机值
 * @param maxPoint 最大点数
 * @param minPoint 最小点数
 */
export function rollPoint(maxPoint: number, minPoint = 1): number {
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
}

interface RollRes {
  str: string;
  value: number;
}
/**
 * 投骰
 * @param requestStr 投骰表达式 如1d100
 */
export function roll(requestStr: string): RollRes {
  const pattern = /(\d*)\s*d\s*(\d*)/gi;

  requestStr = requestStr.replace(/[^\dd\+-\/\*\(\)]+/gi, ''); //去除无效或危险字符
  const express = requestStr.replace(pattern, function(tag, num, dice) {
    num = num || 1;
    dice = dice || 100;
    const res = [];
    for (var i = 0; i < num; i++) {
      res.push(rollPoint(dice));
    }

    if (num > 1) {
      return '(' + res.join('+') + ')';
    } else {
      return res.join('+');
    }
  });

  if (_.isEmpty(requestStr) || _.isEmpty(express)) {
    throw new Error('invalid request');
  }

  const result = eval(express);
  const str = requestStr + '=' + express + '=' + result;
  return {
    str,
    value: Number(result),
  };
}

interface RollJudgeRes extends RollRes {
  isHidden: boolean; // 是否为暗骰
  success: boolean; // 是否成功
  targetValue: number; // 判定目标点
  targetProps: string; //判定属性点
}
/**
 * 投掷判定骰
 * @param requestStr 请求
 * @param contextData 数据上下文
 */
export function rollJudge(requestStr: string, contextData: {}): RollJudgeRes {
  if (!requestStr.startsWith('a')) {
    throw new Error('不正确的表达式:' + requestStr);
  }

  const args = requestStr.split(' ');
  const params = args[0];

  let isHiddenDice = params.includes('h'); // 是否为暗骰
  let bonus = 0; // TODO: 奖励点
  let targetValue = null; // 判定目标属性
  let targetProps = ''; // 判定目标属性

  // 字符串处理
  if (args.length === 2) {
    if (isNumberStr(args[1])) {
      targetValue = Number(args[1]);
    } else {
      targetProps = args[1];
    }
  } else {
    targetProps = args[1];
    if (isNumberStr(args[2])) {
      targetValue = Number(args[2]);
    }
  }

  // 读取上下文
  if (_.isNull(targetValue)) {
    // 如果没有指定目标, 则尝试从上下文中获取数据
    const tmp = Number(_.get(contextData, [targetProps]));
    if (!isNaN(tmp)) {
      targetValue = tmp;
    }
  }

  const { str, value } = roll('1d100');

  let success: boolean;
  if (value < (targetValue ?? 50)) {
    // 成功
    success = true;
  } else {
    // 失败
    success = false;
  }

  return {
    str,
    value,
    success,
    targetValue,
    targetProps,
    isHidden: isHiddenDice,
  };
}
